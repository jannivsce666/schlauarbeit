// assets/js/news.js
(() => {
  const NEWS_URL = 'assets/data/news.json';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const grid = $('#newsGrid');
  const srcFilter = $('#sourceFilter');
  const searchInput = $('#newsSearch');
  const refreshBtn = $('#refreshBtn');
  const updatedTxt = $('#updatedTxt');

  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./,''); } catch { return ''; } };
  const toISO = (v) => {
    const d = new Date(v || 0);
    return isNaN(d) ? new Date(0).toISOString() : d.toISOString();
  };

  async function loadNews(bust = false) {
    try {
      const url = bust ? `${NEWS_URL}?ts=${Date.now()}` : NEWS_URL;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Support: Array ODER { items: [...] }
      const raw = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);

      // Normalisieren
      const items = raw.map(it => {
        const url = it.url || it.link || '';
        const title = it.title || '';
        const summary = it.summary || it.description || '';
        const date = toISO(it.date || it.pubDate || it.isoDate || it.updated);
        const source = it.source || host(url) || 'Quelle';
        const image = it.image || (it.enclosure && it.enclosure.url) || null;
        const id = it.id || (title + '|' + url).slice(0, 300);
        return { id, title, url, summary, date, source, image };
      }).filter(x => x.title && x.url);

      // UI aufbauen
      buildSourceFilter(items);
      render(items);

      const when = new Date().toLocaleString();
      updatedTxt.textContent = `Stand: ${when} — ${items.length} Beiträge`;
    } catch (err) {
      console.error('News load failed:', err);
      grid.innerHTML = `<div class="muted">Konnte News nicht laden. Bitte später erneut versuchen.</div>`;
    }
  }

  function buildSourceFilter(items) {
    const sources = Array.from(new Set(items.map(i => i.source))).sort((a,b)=>a.localeCompare(b));
    srcFilter.innerHTML = `<option value="">Alle Quellen</option>` +
      sources.map(s => `<option>${s}</option>`).join('');
  }

  function render(items) {
    const q = (searchInput.value || '').toLowerCase().trim();
    const src = srcFilter.value || '';

    const filtered = items.filter(it => {
      const okSrc = !src || it.source === src;
      const okQ = !q || (it.title + ' ' + (it.summary || '') + ' ' + it.source).toLowerCase().includes(q);
      return okSrc && okQ;
    });

    if (!filtered.length) {
      grid.innerHTML = `<div class="muted">Keine Treffer für die aktuelle Auswahl.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(it => card(it)).join('');
  }

  function card(it) {
    const dateStr = new Date(it.date).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'2-digit' });
    return `
      <article class="card" data-id="${escapeHtml(it.id)}">
        <div class="media">
          ${it.image ? `<img src="${escapeHtml(it.image)}" alt="">`
                      : `<img src="assets/img/hero-illustration.svg" alt="">`}
        </div>
        <div class="body">
          <div class="badge">${escapeHtml(it.source)} • ${dateStr}</div>
          <h3 style="margin:.5rem 0 0.25rem">${escapeHtml(it.title)}</h3>
          <p class="muted" style="margin:0 0 .75rem">${escapeHtml(it.summary || '').slice(0,200)}</p>
          <a class="btn" href="${escapeHtml(it.url)}" target="_blank" rel="noopener">Lesen</a>
        </div>
      </article>
    `;
  }

  function escapeHtml(s='') {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  // Events
  let latestItems = [];
  // Re-render bei Filter/Suche: wir holen Items aus DOM wieder raus
  function currentItemsFromDOM() {
    // Wir halten es simpel: beim Rendern überschreiben wir latestItems:
    return latestItems;
  }

  const hydrate = async () => {
    // Erstmal laden
    const url = `${NEWS_URL}?ts=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    latestItems = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
    // Normalisierung wie oben:
    latestItems = latestItems.map(it => {
      const url = it.url || it.link || '';
      const title = it.title || '';
      const summary = it.summary || it.description || '';
      const date = toISO(it.date || it.pubDate || it.isoDate || it.updated);
      const source = it.source || host(url) || 'Quelle';
      const image = it.image || (it.enclosure && it.enclosure.url) || null;
      const id = it.id || (title + '|' + url).slice(0, 300);
      return { id, title, url, summary, date, source, image };
    }).filter(x => x.title && x.url);

    buildSourceFilter(latestItems);
    render(latestItems);
    const when = new Date().toLocaleString();
    updatedTxt.textContent = `Stand: ${when} — ${latestItems.length} Beiträge`;
  };

  searchInput?.addEventListener('input', () => render(latestItems));
  srcFilter?.addEventListener('change', () => render(latestItems));
  refreshBtn?.addEventListener('click', () => hydrate());

  // initial
  hydrate();
})();
