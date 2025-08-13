// sw.js  — v6
const CACHE_STATIC = 'schlau-static-v6';
const CACHE_PAGES  = 'schlau-pages-v6';

const STATIC_ASSETS = [
  '/', '/index.html',
  '/assets/img/logo.svg','/assets/img/favicon.svg','/assets/img/hero-illustration.svg',
  '/assets/js/app.js','/assets/js/guides.js','/assets/js/marketplace.js','/assets/js/auth.js',
  '/assets/js/news.js','/assets/js/offer-new.js','/assets/js/guide-new.js','/assets/js/account.js'
  // CSS lassen wir über SWR laden (siehe fetch-Handler unten)
];

self.addEventListener('install', (event) => {
  // neue Version sofort aktivierbar machen
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // alte Caches weg
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![CACHE_STATIC, CACHE_PAGES].includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Hilfsfunktionen
const isHTML = (req) =>
  req.mode === 'navigate' ||
  (req.headers.get('accept') || '').includes('text/html');

const isAsset = (url) =>
  url.pathname.startsWith('/assets/');

// Network-first für HTML (schnelles Aktualisieren von Seiten/Styles)
async function handleHTML(event) {
  const req = event.request;
  try {
    const fresh = await fetch(req, { cache: 'no-store' });
    const cache = await caches.open(CACHE_PAGES);
    cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cache = await caches.open(CACHE_PAGES);
    const cached = await cache.match(req);
    if (cached) return cached;
    // Fallback auf Startseite
    return caches.match('/index.html');
  }
}

// Stale-While-Revalidate für Assets (JS, Bilder, **CSS**)
async function handleAsset(event) {
  const req = event.request;
  const cache = await caches.open(CACHE_STATIC);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    // erfolgreiche Antworten in Cache legen
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  }).catch(() => null);

  // sofort irgendwas zeigen, danach im Hintergrund aktualisieren
  return cached || fetchPromise;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nur gleiche Origin cachen
  if (url.origin !== location.origin) return;

  if (isHTML(event.request)) {
    event.respondWith(handleHTML(event));
  } else if (isAsset(url)) {
    event.respondWith(handleAsset(event));
  }
});

// Nachricht vom Client: sofort aktiv werden
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
