// assets/js/guides.js — kompakte Karten; kombiniert lokale + remote Guides
(() => {
  const KEY = 'schlau_guides_v1';

  const $ = (s, r = document) => r.querySelector(s);
  const grid = $('#guideGrid');
  const search = $('#guideSearch');
  const addBtn = $('#addGuideBtn');

  addBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    location.href = 'guide-new.html';
  });

  // --- Local store
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }

  // --- Remote store
  let remote = [];
  async function loadRemote() {
    try {
      const res = await fetch('assets/data/guides.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      remote = Array.isArray(data.items) ? data.items : [];
    } catch {
      remote = [];
    }
  }

  // --- Helpers
  const escapeHTML = (s) =>
    (s || '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  function matches(it, q) {
    if (!q) return true;
    const t = q.toLowerCase();
    if (it._origin === 'remote') {
      return [it.title, it.summary, it.source].filter(Boolean).join(' ').toLowerCase().includes(t);
    }
    return [it.title, it.category, it.desc, it.materials].filter(Boolean).join(' ').toLowerCase().includes(t);
  }

  // --- Card templates (COMPACT)
  function cardRemote(it) {
    return `
      <article class="card compact">
        ${it.image ? `<div class="media"><img loading="lazy" src="${it.image}" alt=""></div>` : `<div class="media"></div>`}
        <div class="body">
          <div class="badge">${escapeHTML(it.source || 'Quelle')}</div>
          <h3 class="clamp-2">${escapeHTML(it.title || '')}</h3>
          <p class="muted clamp-3">${escapeHTML(it.summary || '')}</p>
          <a class="btn small" href="${it.link}" target="_blank" rel="noopener">Guide öffnen</a>
        </div>
      </article>
    `;
  }

  function cardLocal(it) {
    return `
      <article class="card compact">
        ${it.imageDataUrl ? `<div class="media"><img loading="lazy" src="${it.imageDataUrl}" alt=""></div>` : `<div class="media"></div>`}
        <div class="body">
          <div class="badge">${escapeHTML(it.category || 'DIY')}</div>
          <h3 class="clamp-2">${escapeHTML(it.title || '')}</h3>
          <p class="muted clamp-3">${escapeHTML(it.desc || '')}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn small" href="guide-new.html#view=${encodeURIComponent(it.id)}">Bearbeiten</a>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    if (!grid) return;
    const q = (search?.value || '').trim();
    const local = readLocal().map(x => ({ ...x, _origin: 'local' }));
    const ext = remote.map(x => ({ ...x, _origin: 'remote' }));

    let all = [...ext, ...local];
    if (q) all = all.filter(it => matches(it, q));

    grid.innerHTML = all.length
      ? all.map(it => it._origin === 'remote' ? cardRemote(it) : cardLocal(it)).join('')
      : `<p class="muted">Keine Anleitungen gefunden.</p>`;
  }

  search?.addEventListener('input', render);

  (async () => { await loadRemote(); render(); })();
})();
