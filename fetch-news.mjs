// Node 18+ (nutzt global fetch, kein node-fetch nötig)
import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const FEEDS = [
  "https://www.tagesschau.de/xml/rss2",
  "https://www.theguardian.com/environment/rss",
  "https://www.cleanenergywire.org/taxonomy/term/3/feed",
  "https://www.euractiv.com/section/energy-environment/feed/"
];

const OUT = path.resolve("assets/data/news.json");
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
const KW = ["klima","klimawandel","klimaschutz","co2","emission","energie",
            "energiewende","solar","photovoltaik","wind","wärme","heizung",
            "wärmepumpe","verkehr","recycling","nachhalt","renewable","green"];

const text = (t="") => String(t).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const pickDate = (o) => {
  const c = o?.pubDate || o?.published || o?.updated || o?.["dc:date"] || o?.["@_updated"];
  const d = new Date(c || 0);
  return isNaN(d) ? new Date(0) : d;
};
const host = (u)=>{ try{ return new URL(u).hostname.replace(/^www\./,""); }catch{ return ""; } };

function norm(xml, feedUrl){
  const j = parser.parse(xml);
  let items = [];
  if (j.rss?.channel?.item) {
    const ch = j.rss.channel;
    const arr = Array.isArray(ch.item) ? ch.item : [ch.item];
    items = arr.map(it=>{
      const link = it.link?.["@_href"] || it.link || "";
      return {
        id: String(it.guid?.["#text"] || it.guid || link || text(it.title)).slice(0,300),
        title: text(it.title),
        url: link,
        summary: text(it.description || it["content:encoded"] || ""),
        date: pickDate(it).toISOString(),
        source: text(ch.title) || host(link) || host(feedUrl)
      };
    });
  } else if (j.feed?.entry) {
    const feed = j.feed;
    const arr = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
    items = arr.map(e=>{
      let link = "";
      if (Array.isArray(e.link)) link = e.link.find(l=>l["@_rel"]==="alternate")?.["@_href"] || e.link[0]["@_href"] || "";
      else link = e.link?.["@_href"] || "";
      return {
        id: String(e.id || link || text(e.title)).slice(0,300),
        title: text(e.title),
        url: link,
        summary: text(e.summary || e.content || ""),
        date: pickDate(e).toISOString(),
        source: text(feed.title) || host(link) || host(feedUrl)
      };
    });
  }
  return items;
}
const matches = (it)=> KW.some(k => (it.title+" "+(it.summary||"")).toLowerCase().includes(k));
const dedupe = (arr)=> {
  const seen = new Set();
  return arr.filter(x=>{
    const key = (x.title + "|" + x.url).toLowerCase();
    if (seen.has(key)) return false; seen.add(key); return true;
  });
};

(async ()=>{
  let all = [];
  for (const url of FEEDS) {
    try{
      const r = await fetch(url, { headers: { "User-Agent":"SchlauarbeitBot/1.0" } });
      const xml = await r.text();
      all.push(...norm(xml, url).filter(matches));
    }catch(e){ console.warn("Feed fail:", url, String(e)); }
  }
  all = dedupe(all).sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,60);
  await fs.mkdir(path.dirname(OUT), { recursive:true });
  await fs.writeFile(OUT, JSON.stringify(all, null, 2));
  console.log("Wrote", OUT, all.length, "items");
})();
