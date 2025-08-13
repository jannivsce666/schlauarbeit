// aggregator/guides.mjs
import Parser from 'rss-parser';
import fs from 'fs/promises';

const parser = new Parser({
  headers: { 'User-Agent': 'SchlauarbeitBot/1.0 (+https://schlauarbeit.de)' }
});

// Quellen (du kannst später erweitern/ändern)
const FEEDS = [
  { url: 'https://makezine.com/feed/', source: 'Make:' },
  { url: 'https://lowtechmagazine.com/feeds/all.atom.xml', source: 'Low-tech Magazine' },
  { url: 'https://www.treehugger.com/rss.xml', source: 'Treehugger' },
  { url: 'https://www.instructables.com/tag/type-id/category-workshop/rss', source: 'Instructables (Workshop)' },
  // Beispiel YouTube-Kanäle (Atom-Feed)
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCfMJ2MchTSW2kWaT0kK94Yw', source: 'I Like To Make Stuff' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCiDJtJKMICpb9B1qf7qjEOA', source: 'This Old House' }
];

const KEYWORDS = [
  'diy','how to','build','reparieren','repair','upcycling','holz','wood',
  'garden','garten','kompost','insulation','dämm','regen','rain',
  'solar','photovoltaic','pv','energie','effizienz','re-use','recycle','kreislauf'
];

function matchesKeywords(text) {
  const t = (text || '').toLowerCase();
  return KEYWORDS.some(k => t.includes(k));
}

function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = (it.link || '') + (it.title || '');
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

function trimText(str, n = 240) {
  if (!str) return '';
  const s = str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function extractImage(it) {
  // enclosure
  if (it.enclosure && it.enclosure.url) return it.enclosure.url;
  // media:thumbnail / media:content
  const mediaThumb = it['media:thumbnail']?.url || it['media:content']?.url;
  if (mediaThumb) return mediaThumb;
  // aus content HTML
  const html = it['content:encoded'] || it.content || '';
  const m = html && html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return m[1];
  return null;
}

async function parseOne(f) {
  try {
    const feed = await parser.parseURL(f.url);
    const items = [];
    for (const it of feed.items || []) {
      const date = new Date(it.isoDate || it.pubDate || Date.now()).toISOString();
      const item = {
        title: it.title || '',
        link: it.link || '',
        date,
        source: f.source,
        summary: trimText(it.contentSnippet || it.content || it.summary || ''),
        image: extractImage(it)
      };
      if (matchesKeywords(`${item.title} ${item.summary}`)) {
        items.push(item);
      }
    }
    return items;
  } catch (e) {
    // Quelle fehlgeschlagen -> ignoriere
    return [];
  }
}

async function main() {
  const all = [];
  for (const f of FEEDS) {
    const got = await parseOne(f);
    all.push(...got);
  }
  const items = dedupe(all)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 48);

  const payload = {
    generatedAt: new Date().toISOString(),
    items
  };

  await fs.mkdir('assets/data', { recursive: true });
  await fs.writeFile('assets/data/guides.json', JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`OK: ${items.length} DIY-Guides → ${process.cwd()}/assets/data/guides.json`);
}

main();
