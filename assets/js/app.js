// assets/js/app.js
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // --- Mobile Nav ---
  const navToggle = $('#navToggle');
  const navMenu   = $('#navMenu');

  function closeNav(){ navMenu?.classList.remove('open'); navToggle?.setAttribute('aria-expanded','false'); }
  function openNav(){  navMenu?.classList.add('open');    navToggle?.setAttribute('aria-expanded','true'); }

  navToggle?.addEventListener('click', () => {
    const isOpen = navMenu?.classList.contains('open');
    isOpen ? closeNav() : openNav();
  });

  // Links schließen das Menü am Handy
  $$('#navMenu a').forEach(a => a.addEventListener('click', closeNav));
  // ESC schließt
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

  // --- Theme Toggle ---
  const themeBtn = $('#themeToggle');
  const root = document.documentElement;
  const THEME_KEY = 'schlau_theme';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') root.classList.add('theme-dark');

  themeBtn?.addEventListener('click', () => {
    root.classList.toggle('theme-dark');
    localStorage.setItem(THEME_KEY, root.classList.contains('theme-dark') ? 'dark' : 'light');
  });

  // --- PWA Installation ---
  const installBtn = $('#installBtn');
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn?.classList.remove('ghost'); // einfache Sichtbarkeit
    installBtn?.removeAttribute('disabled');
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(()=>{});
    deferredPrompt = null;
    installBtn?.setAttribute('disabled', 'true');
  });

  // Service Worker (falls vorhanden)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
})();
