// aggregator/guides.mjs
import Parser from 'rss-parser';
import fs from 'fs/promises';

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'Schlauarbeit Guides Aggregator (+https://schlauarbeit.de)' }
});

// ⚠️ Feeds anpassbar. Der Aggregator überspringt 403/404 automatisch.
const FEEDS = [
  { url: 'https://makezine.com/feed/',                source: 'Make:' },
  { url: 'https://hackaday.com/blog/feed/',           source: 'Hackaday' },
  { url: 'https://www.smarticular.net/feed/',         source: 'smarticular' },
  { url: 'https://utopia.de/feed',                    source: 'Utopia' },
  { url: 'https://www.ikeahackers.net/feed',          source: 'IKEA Hackers' },
  { url: 'https://solar.lowtechmagazine.com/feeds/all.atom.xml', source: 'Low-Tech Magazine' }
];

const KEYWORDS = [
  'diy','selbst','reparatur','repair','upcycling','do it yourself',
  'holz','wood','möbel','furniture','ikea hack','hack',
  'garten','garden','kompost','komposter','regenfass','rain barrel',
  'energie sparen','insulation','dämmung','led','strom','heizen','wärme',
  'recyc','kreislauf','circular','zero waste','nachhalt','sustain'
];

function matchesKeywords(text){
  const t = (text || '').toLowerCase();
  return KEYWORDS.some(k => t.includes(k));
}

function dedupe(items){
  const seen = new Set();
  return items.filter(it => {
    const key = (it.link||'') + '|' + (it.title||'');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function trimText(str, n=260){
  if(!str) return '';
  const s = str.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  return s.length>n ? s.slice(0,n-1)+'…' : s;
}

function firstImgFrom(html=''){
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

async function main(){
  const all = [];
  for (const f of FEEDS){
    try{
      const feed = await parser.parseURL(f.url);
      for (const it of feed.items || []){
        const date = new Date(it.isoDate || it.pubDate || Date.now()).toISOString();
        const content = it['content:encoded'] || it.content || it.summary || it.contentSnippet || '';
        const image = it.enclosure?.url || firstImgFrom(content);
        const item = {
          title: it.title?.trim(),
          link: it.link,
          date,
          source: f.source,
          summary: trimText(content),
          image
        };
        if (matchesKeywords(`${item.title} ${item.summary}`)){
          all.push(item);
        }
      }
    }catch(e){
      console.log('Feed übersprungen:', f.url, e.message || e);
    }
  }

  const items = dedupe(all)
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 48);

  const payload = { generatedAt: new Date().toISOString(), items };

  await fs.mkdir('assets/data', { recursive: true });
  await fs.writeFile('assets/data/guides.json', JSON.stringify(payload, null, 2), 'utf-8');

  console.log(`OK: ${items.length} DIY-Guides → ${process.cwd()}/assets/data/guides.json`);
}

main();
