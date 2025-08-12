// guides.js – Liste + Suche, Button → Editor-Seite
(() => {
  const KEY = 'schlau_guides_v1';
  const grid = document.getElementById('guideGrid');
  const search = document.getElementById('guideSearch');
  const addGuideBtn = document.getElementById('addGuideBtn');

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

  function md(s = '') {
    return s
      .replace(/^### (.*)$/gim, '<h3>$1</h3>')
      .replace(/^## (.*)$/gim, '<h2>$1</h2>')
      .replace(/^# (.*)$/gim, '<h1>$1</h1>')
      .replace(/^- (.*)$/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
  }

  function render(list) {
    if (!grid) return;
    grid.innerHTML = '';
    if (!list.length) { grid.innerHTML = '<p class="muted">Keine Anleitungen.</p>'; return; }
    for (const g of list) {
      const c = document.createElement('article');
      c.className = 'card';
      c.innerHTML = `
        <div class="media">${g.image ? `<img src="${g.image}" alt="">` : ''}</div>
        <div class="body">
          <div class="badge">${g.category} • ${g.difficulty}${g.hours ? ` • ~${g.hours}h` : ''}</div>
          <h3>${g.title}</h3>
          <details class="muted">
            <summary>Details</summary>
            <div class="prose">
              <p><strong>Materialien:</strong> ${g.materials || '-'}</p>
              <div>${md(g.steps || '')}</div>
            </div>
          </details>
        </div>`;
      grid.appendChild(c);
    }
  }

  function apply() {
    const q = (search?.value || '').toLowerCase();
    const list = read().filter(g =>
      [g.title, g.category, g.materials].join(' ').toLowerCase().includes(q)
    );
    render(list);
  }

  addGuideBtn && addGuideBtn.addEventListener('click', () => location.href = 'guide-new.html');
  search && search.addEventListener('input', apply);

  apply();
})();
