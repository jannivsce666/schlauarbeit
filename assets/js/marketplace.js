// marketplace.js – Liste + Filter, „Angebot einstellen“ öffnet Editor-Seite
(() => {
  const LS_KEY = 'schlau_offers_v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const read = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
  const write = (v) => localStorage.setItem(LS_KEY, JSON.stringify(v));

  const marketGrid = $('#marketGrid');
  const marketSearch = $('#marketSearch');
  const filterCategory = $('#filterCategory');
  const filterType = $('#filterType');
  const addOfferBtn = $('#addOfferBtn');

  let currentUser = window.__authUser || null;
  let offers = read();

  function canRemove(o) {
    return !!(currentUser && (o.uid === currentUser.uid || window.__isAdmin));
  }
  function updateOfferButton() {
    if (!addOfferBtn) return;
    if (currentUser) { addOfferBtn.disabled = false; addOfferBtn.title = 'Angebot einstellen'; }
    else { addOfferBtn.disabled = true; addOfferBtn.title = 'Bitte erst einloggen'; }
  }

  function render(list) {
    if (!marketGrid) return;
    marketGrid.innerHTML = '';
    if (!list.length) { marketGrid.innerHTML = '<p class="muted">Keine Angebote.</p>'; return; }
    for (const o of list) {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <div class="media">${o.image ? `<img src="${o.image}" alt="">` : ''}</div>
        <div class="body">
          <div class="badge">${o.category} • ${o.type}</div>
          <h3>${o.title}</h3>
          <div class="muted">📍 ${o.location || ''}</div>
          <p>${(o.desc || '').slice(0, 180)}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <a class="btn" href="mailto:${o.contact}?subject=${encodeURIComponent('[Schlauarbeit] '+o.title)}">Kontakt</a>
            ${canRemove(o) ? `<button class="btn" data-remove="${o.id}">Löschen</button>` : ''}
          </div>
        </div>`;
      marketGrid.appendChild(el);
    }
    $$('[data-remove]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-remove');
      offers = offers.filter(x => x.id !== id);
      write(offers); apply();
    }));
  }

  function apply() {
    const q = (marketSearch?.value || '').toLowerCase();
    const c = filterCategory?.value || '';
    const t = filterType?.value || '';
    const list = offers.filter(o =>
      (!q || `${o.title} ${o.location} ${o.desc}`.toLowerCase().includes(q)) &&
      (!c || o.category === c) &&
      (!t || o.type === t)
    );
    render(list);
  }

  window.addEventListener('auth-changed', e => { currentUser = e.detail || null; updateOfferButton(); apply(); });

  addOfferBtn && addOfferBtn.addEventListener('click', () => {
    if (!currentUser) { alert('Bitte zuerst einloggen.'); return; }
    // Neuer Editor als eigene Seite:
    location.href = 'offer-new.html';
  });

  marketSearch && marketSearch.addEventListener('input', apply);
  filterCategory && filterCategory.addEventListener('change', apply);
  filterType && filterType.addEventListener('change', apply);

  updateOfferButton();
  apply();
})();
