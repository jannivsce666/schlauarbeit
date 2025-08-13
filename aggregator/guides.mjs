// aggregator/guides.mjs
// Holt DIY-Guides aus RSS-Feeds, filtert grob auf "grüne" Themen und schreibt assets/data/guides.json

import fs from "fs/promises";
import path from "path";
import Parser from "rss-parser";
import { fetch } from "undici";
import { JSDOM } from "jsdom";

const OUT_FILE = path.resolve("assets/data/guides.json");

// Quellen (ergänzbar)
const FEEDS = [
  { source: "IKEA Hackers", url: "https://www.ikeahackers.net/feed" },
  { source: "Make: Workshop", url: "https://makezine.com/category/workshop/feed/" },
  { source: "Lifehacker DIY", url: "https://lifehacker.com/tag/diy/rss" },
  { source: "Low-tech Magazine", url: "https://solar.lowtechmagazine.com/atom.xml" },
];

// einfache Themen-Filter (DE/EN)
const KEYWORDS = [
  "solar","photovoltaik","regen","rain","rain barrel","wasser","water",
  "isol","insulat","heizung","wärme","däm","kompost","compost","upcycl",
  "repar","repair","recycle","holz","wood","garten","bike","fahrrad",
  "strom","energie","nachhalt","sustainable"
];

const parser = new Parser({
  headers: { "User-Agent": "schlauarbeit-guides-bot/1.0 (+https://schlauarbeit.de)" }
});

function hasKeyword(s) {
  const t = (s || "").toLowerCase();
  return KEYWORDS.some(k => t.includes(k));
}

function strip(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchOGImage(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 15000 });
    if (!r.ok) return null;
    const html = await r.text();
    const dom = new JSDOM(html);
    const d = dom.window.document;
    const og = d.querySelector('meta[property="og:image"],meta[name="og:image"]');
    const tw = d.querySelector('meta[name="twitter:image"]');
    const link = og?.getAttribute("content") || tw?.getAttribute("content");
    return link || null;
  } catch { return null; }
}

function cleanItem(it, source) {
  const title = it.title || "";
  const link = it.link || it.guid || "";
  const date = it.isoDate || it.pubDate || "";
  const summary = strip(it.contentSnippet || it.content || it["content:encoded"] || "");
  const enclosureUrl = it.enclosure?.url || it["media:content"]?.url;

  return {
    id: link || title,
    title, link, date,
    summary,
    image: enclosureUrl || null,
    source
  };
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(x => {
    const key = (x.title || "") + "::" + (x.link || "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function run() {
  let all = [];

  for (const f of FEEDS) {
    try {
      const feed = await parser.parseURL(f.url);
      const mapped = (feed.items || []).map(it => cleanItem(it, f.source));
      all.push(...mapped);
      console.log(`OK: ${f.source} → ${mapped.length} Einträge`);
    } catch (e) {
      console.warn(`Feed fehlgeschlagen: ${f.url} → ${e.message}`);
    }
  }

  // filtern (wenn kein Treffer → alles durchlassen)
  const filtered = all.filter(it => hasKeyword(it.title + " " + it.summary)) || all;

  // fehlende Bilder via OG scrapen (sanft, nur wenige)
  const enriched = [];
  for (const it of filtered.slice(0, 120)) {
    if (!it.image && it.link) {
      it.image = await fetchOGImage(it.link);
    }
    enriched.push(it);
  }

  const out = dedupe(enriched)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 60);

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(
    OUT_FILE,
    JSON.stringify({ generatedAt: new Date().toISOString(), items: out }, null, 2),
    "utf8"
  );

  console.log(`OK: ${out.length} Guides → ${OUT_FILE}`);
}

run().catch(e => { console.error(e); process.exit(1); });
