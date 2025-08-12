// sw.js
const CACHE = 'schlau-v4';
const ASSETS = [
  './','./index.html','./news.html','./calculators.html','./guide-new.html','./offer-new.html','./account.html',
  './assets/css/styles.css',
  './assets/js/app.js','./assets/js/auth.js',
  './assets/js/guides.js','./assets/js/guide-new.js',
  './assets/js/marketplace.js','./assets/js/offer-new.js',
  './assets/js/account.js','./assets/js/calculators.js',
  './assets/js/news.js',
  './assets/img/logo.svg','./assets/img/favicon.svg','./assets/img/hero-illustration.svg',
  './assets/data/news.json'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting?.();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request)));
});
