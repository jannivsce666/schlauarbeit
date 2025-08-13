// assets/js/news.js — kompakte News-Karten mit Clamp & kleinerem Media
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const grid = $('#newsGrid');
  const search = $('#newsSearch');
  const sourceSel = document.querySelector('#sourceSelect, #newsSource, #filterSource');
  const refreshBtn = document.querySelector('#refreshBtn, #refreshNews');

  let items = [];

  async function load() {
    try {
      const res = await fetch('assets/data/news.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(res.statusText);
      items = await res.json();
    } catch {
      items = [];
    }
  }

  const escapeHTML = (s) =>
    (s || '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  function card(it) {
    const src = escapeHTML(it.source || '');
    const date = it.date ? new Date(it.date).toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric' }) : '';
    return `
      <article class="card compact">
        ${it.image ? `<div class="media"><img loading="lazy" src="${it.image}" alt=""></div>` : `<div class="media"></div>`}
        <div class="body">
          <div class="badge">${src} • ${date}</div>
          <h3 class="clamp-2">${escapeHTML(it.title || '')}</h3>
          <p class="muted clamp-3">${escapeHTML(it.summary || '')}</p>
          <a class="btn small" href="${it.url}" target="_blank" rel="noopener">Artikel lesen</a>
        </div>
      </article>
    `;
  }

  function render() {
    if (!grid) return;
    const q = (search?.value || '').trim().toLowerCase();
    const src = (sourceSel?.value || '').trim();
    let list = items;

    if (src) list = list.filter(it => (it.source || '') === src);
    if (q) list = list.filter(it =>
      [it.title, it.summary, it.source].filter(Boolean).join(' ').toLowerCase().includes(q)
    );

    grid.innerHTML = list.length
      ? list.map(card).join('')
      : `<p class="muted">Keine Beiträge gefunden.</p>`;
  }

  search?.addEventListener('input', render);
  sourceSel?.addEventListener('change', render);
  refreshBtn?.addEventListener('click', async () => { await load(); render(); });

  (async () => { await load(); render(); })();
})();
