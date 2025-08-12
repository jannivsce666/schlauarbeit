// aggregator/index.mjs
// Node >= 18
import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";

// ---- Quellen ---------------------------------------------------------
const DIRECT_FEEDS = [
  { url: "https://www.tagesschau.de/xml/rss2", source: "tagesschau" },
  { url: "https://www.theguardian.com/environment/rss", source: "The Guardian – Environment" },
  { url: "https://www.carbonbrief.org/feed/", source: "Carbon Brief" }
];

// blockierte Quellen via Google News RSS (stabil & schnell)
const GN_QUERIES = [
  { label: "Euractiv – Energy & Environment", site: "euractiv.com", query: "energy OR environment" },
  { label: "Canary Media", site: "canarymedia.com", query: "" },
  { label: "NASA Climate", site: "climate.nasa.gov", query: "" },
  { label: "UNEP", site: "unep.org", query: "" }
];

const googleNewsFeed = ({ site, query = "", hl = "de", gl = "DE", ceid = "DE:de" }) => {
  const q = [query, site ? `site:${site}` : ""].filter(Boolean).join(" ");
  const u = new URL("https://news.google.com/rss/search");
  u.searchParams.set("q", q);
  u.searchParams.set("hl", hl);
  u.searchParams.set("gl", gl);
  u.searchParams.set("ceid", ceid);
  return u.toString();
};

// ---- Einstellungen ---------------------------------------------------
const KEYWORDS = [
  "klima","klimawandel","klimaschutz","co2","co₂","emission","emissions",
  "energie","energiewende","solar","photovoltaik","pv","wind",
  "wärme","heizung","wärmepumpe","heat pump","geothermal","storage","batter",
  "verkehr","ev","charging","effizienz","insulation","recycling","nachhalt",
  "renewable","green","net zero","carbon"
];

const OUT_FILE = path.resolve("assets/data/news.json");

// Optionaler Fallback: OG-Bild von der Zielseite scrapen
// Achtung: macht den Lauf etwas langsamer. Bei Bedarf auf false stellen.
const ENABLE_OG_SCRAPE = true;
const OG_SCRAPE_MAX = 20; // höchstens bei so vielen Einträgen ohne Bild OG-Bild nachladen

// ---- Parser mit extra Feldern (media:content / media:thumbnail) -----
const parser = new Parser({
  timeout: 20000,
  requestOptions: {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SchlauarbeitBot/1.0; +https://schlauarbeit.de)",
      "Accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7",
      "Referer": "https://schlauarbeit.de/"
    }
  },
  // Parse zusätzliche Felder/Attribute ein
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["enclosure", "enclosure"],
      ["image", "image"]
    ]
  }
});

// ---- Helfer ----------------------------------------------------------
const plain = (v="") => String(v).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./,""); } catch { return ""; } };
const pickDate = (it={}) => {
  const cand = it.isoDate || it.pubDate || it.published || it.updated || it.date;
  const d = new Date(cand || 0);
  return isNaN(d) ? new Date(0) : d;
};
const matches = (title, summary) => {
  const hay = (title + " " + (summary || "")).toLowerCase();
  return KEYWORDS.some(k => hay.includes(k));
};
const dedupe = (arr) => {
  const seen = new Set();
  return arr.filter(x => {
    const key = (x.title + "|" + x.url).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const toOrigin = (link) => {
  try {
    const u = new URL(link);
    const real = u.searchParams.get("url");
    return real ? decodeURIComponent(real) : link;
  } catch { return link; }
};

// Bild aus verschiedenen Feldern ziehen
function pickImage(it) {
  // 1) enclosure
  if (it.enclosure?.url) return it.enclosure.url;

  // 2) media:content (mit Attributen)
  const mc = it.mediaContent;
  if (mc && mc.length) {
    // bevorzuge images (medium=image) oder größte Breite
    const byMedium = mc.find(x => x.$?.medium === "image" && x.$?.url);
    if (byMedium) return absolutize(byMedium.$.url, it.link);

    const widest = [...mc].sort((a, b) => (parseInt(b.$?.width||"0",10) - parseInt(a.$?.width||"0",10)))[0];
    const mcUrl = widest?.$?.url || widest?.url;
    if (mcUrl) return absolutize(mcUrl, it.link);
  }

  // 3) media:thumbnail
  const mt = it.mediaThumbnail;
  if (mt && mt.length) {
    const tUrl = mt[0]?.$?.url || mt[0]?.url;
    if (tUrl) return absolutize(tUrl, it.link);
  }

  // 4) item.image (manche Feeds)
  if (it.image) return absolutize(it.image, it.link);

  return null;
}

function absolutize(u, base) {
  try {
    if (!u) return null;
    if (u.startsWith("//")) return "https:" + u;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    return new URL(u, base || "https://").toString();
  } catch { return u; }
}

// OG-Image scrapen (optional)
async function fetchOgImage(pageUrl) {
  try {
    const res = await fetch(pageUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SchlauarbeitBot/1.0; +https://schlauarbeit.de)",
        "Accept": "text/html,application/xhtml+xml"
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // og:image / og:image:secure_url / twitter:image
    const re = /<meta\s+(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image)["']\s+content=["']([^"']+)["'][^>]*>/i;
    const m = html.match(re);
    if (!m) return null;

    return absolutize(m[1], pageUrl);
  } catch {
    return null;
  }
}

// ---- Feed-Reader -----------------------------------------------------
async function fetchDirect({ url, source }) {
  try {
    const feed = await parser.parseURL(url);
    return normalize(feed, url, source);
  } catch (e) {
    console.warn("Direct feed fail:", url, String(e));
    return [];
  }
}

async function fetchFromGoogleNews({ label, site, query }) {
  const url = googleNewsFeed({ site, query });
  try {
    const feed = await parser.parseURL(url);
    // Google-News Links auf Original-URL mappen
    const mapped = (feed.items || []).map(it => ({ ...it, link: toOrigin(it.link || "") }));
    feed.items = mapped;
    return normalize(feed, url, label);
  } catch (e) {
    console.warn("GoogleNews feed fail:", url, String(e));
    return [];
  }
}

function normalize(feed, feedUrl, sourceLabel) {
  return (feed.items || []).map(it => {
    const link = it.link || it.guid || "";
    const date = pickDate(it);
    const image = pickImage(it);
    return {
      id: String(it.guid || link || it.title).slice(0, 300),
      title: plain(it.title || ""),
      url: link,
      summary: plain(it.contentSnippet || it.content || it.summary || it["content:encoded"] || ""),
      date: date.toISOString(),
      source: sourceLabel || plain(feed.title || host(link) || host(feedUrl)),
      image: image || null
    };
  });
}

// ---- Main ------------------------------------------------------------
(async function main(){
  const [directArrays, gnArrays] = await Promise.all([
    Promise.all(DIRECT_FEEDS.map(fetchDirect)),
    Promise.all(GN_QUERIES.map(fetchFromGoogleNews))
  ]);

  let all = [...directArrays.flat(), ...gnArrays.flat()]
    .filter(it => matches(it.title, it.summary));

  // OG-Fallback nur für einige ohne Bild
  if (ENABLE_OG_SCRAPE) {
    const noImg = all.filter(x => !x.image).slice(0, OG_SCRAPE_MAX);
    const enriched = await Promise.all(noImg.map(async (x) => {
      const img = await fetchOgImage(x.url);
      if (img) x.image = img;
      return x;
    }));
    // (enriched wird durch Referenz bereits in all gemerged)
  }

  all = dedupe(all)
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 60);

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(all, null, 2), "utf8");
  console.log(`OK: ${all.length} Beiträge → ${OUT_FILE}`);
})().catch(e => { console.error(e); process.exit(1); });
