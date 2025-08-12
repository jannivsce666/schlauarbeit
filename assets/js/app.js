// app.js
(() => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const THEME_KEY = 'schlau_theme';
  const html = document.documentElement;
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') html.classList.add('theme-dark');
  const themeBtn = document.getElementById('themeToggle');
  themeBtn && themeBtn.addEventListener('click', () => {
    html.classList.toggle('theme-dark');
    localStorage.setItem(THEME_KEY, html.classList.contains('theme-dark') ? 'dark' : 'light');
  });

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  navToggle && navMenu && navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  let deferredPrompt;
  const installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
    installBtn && (installBtn.style.display = '');
  });
  installBtn && installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice;
    deferredPrompt = null; installBtn.style.display = 'none';
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.warn);
  }
})();
