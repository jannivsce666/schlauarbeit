// account.js – Profil, eigene Inhalte, Export, Konto löschen
(() => {
  const LS_G = 'schlau_guides_v1';
  const LS_O = 'schlau_offers_v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const read = (k, fb = []) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); } catch { return fb; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const profileBox = $('#profileBox');
  const myGuidesEl = $('#myGuides');
  const myOffersEl = $('#myOffers');
  const exportBtn = $('#exportBtn');
  const alsoWipeLocal = $('#alsoWipeLocal');
  const deleteAccountBtn = $('#deleteAccountBtn');
  const logoutBtn = $('#logoutBtn');

  // Tabs
  $$('.tabs .tab').forEach(b => b.addEventListener('click', () => {
    $$('.tabs .tab').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    $$('.tab-panel').forEach(p => p.style.display = 'none');
    $('#tab-' + b.dataset.tab).style.display = '';
  }));

  let currentUser = window.__authUser || null;

  function renderProfile() {
    if (!profileBox) return;
    if (!currentUser) {
      profileBox.innerHTML = `
        <p>Du bist nicht eingeloggt.</p>
        <button class="btn primary" onclick="window.authSignIn?.()">Mit Google einloggen</button>`;
      return;
    }
    profileBox.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        ${currentUser.photoURL ? `<img src="${currentUser.photoURL}" alt="" style="width:48px;height:48px;border-radius:50%">` : ''}
        <div>
          <div><strong>${currentUser.displayName || 'User'}</strong></div>
          <div class="muted">${currentUser.email || ''}</div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px">
          <a href="guide-new.html" class="btn">Neue Anleitung</a>
          <a href="offer-new.html" class="btn">Neues Angebot</a>
        </div>
      </div>`;
  }

  function renderMine() {
    const uid = currentUser?.uid;
    // Guides
    if (myGuidesEl) {
      const guides = read(LS_G, []).filter(g => g.uid === uid);
      myGuidesEl.innerHTML = '';
      if (!guides.length) myGuidesEl.innerHTML = '<p class="muted">Keine Anleitungen.</p>';
      for (const g of guides) {
        const li = document.createElement('div');
        li.className = 'card';
        li.innerHTML = `
          <div class="body">
            <div class="badge">${g.category} • ${g.difficulty}${g.hours?` • ~${g.hours}h`:''}</div>
            <h3>${g.title}</h3>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="btn" data-delg="${g.id}">Löschen</button>
            </div>
          </div>`;
        myGuidesEl.appendChild(li);
      }
      $("[data-delg]") && [...myGuidesEl.querySelectorAll('[data-delg]')].forEach(b => b.addEventListener('click', () => {
        const id = b.getAttribute('data-delg');
        const next = read(LS_G, []).filter(x => x.id !== id);
        write(LS_G, next); renderMine();
      }));
    }
    // Offers
    if (myOffersEl) {
      const offers = read(LS_O, []).filter(o => o.uid === uid);
      myOffersEl.innerHTML = '';
      if (!offers.length) myOffersEl.innerHTML = '<p class="muted">Keine Angebote.</p>';
      for (const o of offers) {
        const li = document.createElement('div');
        li.className = 'card';
        li.innerHTML = `
          <div class="body">
            <div class="badge">${o.category} • ${o.type}</div>
            <h3>${o.title}</h3>
            <div class="muted">📍 ${o.location || ''}</div>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="btn" data-delo="${o.id}">Löschen</button>
            </div>
          </div>`;
        myOffersEl.appendChild(li);
      }
      $("[data-delo]") && [...myOffersEl.querySelectorAll('[data-delo]')].forEach(b => b.addEventListener('click', () => {
        const id = b.getAttribute('data-delo');
        const next = read(LS_O, []).filter(x => x.id !== id);
        write(LS_O, next); renderMine();
      }));
    }
  }

  exportBtn && exportBtn.addEventListener('click', () => {
    const data = {
      profile: currentUser || {},
      guides: read(LS_G, []),
      offers: read(LS_O, [])
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'schlauarbeit-export.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  deleteAccountBtn && deleteAccountBtn.addEventListener('click', async () => {
    if (!confirm('Konto wirklich löschen? (Login wird entfernt)')) return;
    if (alsoWipeLocal?.checked) {
      localStorage.removeItem(LS_G);
      localStorage.removeItem(LS_O);
    }
    await window.authSignOut?.();
    location.href = 'index.html';
  });

  logoutBtn && logoutBtn.addEventListener('click', () => window.authSignOut?.());

  function renderAll(){ renderProfile(); renderMine(); }
  window.addEventListener('auth-changed', e => { currentUser = e.detail || null; renderAll(); });
  renderAll();
})();
