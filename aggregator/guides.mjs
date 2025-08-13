/**
 * Schlauarbeit – DIY-Guides Aggregator
 * Liest ein paar zuverlässige RSS-/Atom-Feeds ein, normalisiert sie
 * und schreibt assets/data/guides.json
 */
import Parser from 'rss-parser';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT = resolve(__dirname, '../assets/data/guides.json');

const parser = new Parser({
  timeout: 20000,
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumb']
    ]
  }
});

// Quellen (stabil)
const FEEDS = [
  { source: 'IKEA Hackers', url: 'https://www.ikeahackers.net/feed', limit: 20 },
  { source: 'Make: Workshop', url: 'https://makezine.com/category/workshop/feed', limit: 12 },
  { source: 'Low-tech Magazine', url: 'https://solar.lowtechmagazine.com/feeds/all.atom.xml', limit: 8 }
];

// Utility
const strip = (html = '') =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const pickImage = (it) => {
  // 1) enclosure / media
  if (it.enclosure?.url) return it.enclosure.url;
  if (it.mediaContent?.$.url) return it.mediaContent.$.url;
  if (it.mediaThumb?.$.url) return it.mediaThumb.$.url;
  // 2) aus content
  const html = it.contentEncoded || it['content:encoded'] || it.content || '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : '';
};

const normalize = (raw, source) => {
  const title = raw.title || '';
  const link  = raw.link || raw.guid || '';
  const published = raw.isoDate || raw.pubDate || '';
  const summary = strip(raw.contentSnippet || raw.summary || raw.contentEncoded || raw.content || '');
  const image = pickImage(raw);
  return { title, link, summary, image, source, published };
};

async function run() {
  const items = [];

  for (const f of FEEDS) {
    try {
      const feed = await parser.parseURL(f.url);
      const take = (feed.items || []).slice(0, f.limit || 10);
      const norm = take.map((x) => normalize(x, f.source));
      console.log(`OK: ${f.source} → ${norm.length} Einträge`);
      items.push(...norm);
    } catch (e) {
      console.error(`Feed fehlgeschlagen: ${f.url} → ${e.message || e}`);
    }
  }

  // leichte Sortierung: neu zuerst
  items.sort((a, b) => (Date.parse(b.published) || 0) - (Date.parse(a.published) || 0));

  const data = {
    generatedAt: new Date().toISOString(),
    items
  };

  await writeFile(OUT, JSON.stringify(data, null, 2));
  console.log(`OK: ${items.length} Guides → ${OUT}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
