// assets/js/guides.js  — kombiniert lokal + remote
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

  // Lokale Guides (wie gehabt)
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }

  // Remote Guides
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

  function escapeHTML(s){ return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function matches(it, q){
    const t = q.toLowerCase();
    if (it._origin === 'remote') {
      return [it.title, it.summary, it.source].filter(Boolean).join(' ').toLowerCase().includes(t);
    }
    // local
    return [it.title, it.category, it.desc, it.materials].filter(Boolean).join(' ').toLowerCase().includes(t);
  }

  function cardRemote(it){
    return `
      <article class="card">
        ${it.image ? `<div class="media"><img loading="lazy" src="${it.image}" alt=""></div>` : `<div class="media"></div>`}
        <div class="body">
          <div class="badge">${escapeHTML(it.source || 'Quelle')}</div>
          <h3 style="margin:.4rem 0">${escapeHTML(it.title||'')}</h3>
          <p class="muted" style="min-height:3em">${escapeHTML(it.summary||'')}</p>
          <a class="btn" href="${it.link}" target="_blank" rel="noopener">Guide öffnen</a>
        </div>
      </article>
    `;
  }

  function cardLocal(it){
    return `
      <article class="card">
        ${it.imageDataUrl ? `<div class="media"><img loading="lazy" src="${it.imageDataUrl}" alt=""></div>` : `<div class="media"></div>`}
        <div class="body">
          <div class="badge">${escapeHTML(it.category || 'DIY')}</div>
          <h3 style="margin:.4rem 0">${escapeHTML(it.title||'')}</h3>
          <p class="muted" style="min-height:3em">${escapeHTML(it.desc||'')}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn" href="guide-new.html#view=${encodeURIComponent(it.id)}">Bearbeiten</a>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    const q = (search?.value || '').trim();
    const local = readLocal().map(x => ({...x, _origin: 'local'}));
    const ext   = remote.map(x => ({...x, _origin: 'remote'}));

    // Reihenfolge: externe zuerst, dann lokale
    let all = [...ext, ...local];
    if (q) all = all.filter(it => matches(it, q));

    grid.innerHTML = all.length
      ? all.map(it => it._origin === 'remote' ? cardRemote(it) : cardLocal(it)).join('')
      : `<p class="muted">Keine Anleitungen gefunden.</p>`;
  }

  search?.addEventListener('input', render);

  // Init
  (async () => {
    await loadRemote();
    render();
  })();
})();
