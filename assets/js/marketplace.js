// assets/js/marketplace.js
(() => {
  const KEY = "schlau_offers_v1";

  // ---------- Helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const read = (k, fb = []) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); } catch { return fb; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid = () => (window.__authUser && (window.__authUser.uid || window.__authUser.email)) || null;

  // Jede Offer braucht eine id
  function normalize(offers) {
    let changed = false;
    for (const o of offers) {
      if (!o.id) { o.id = "offer_" + Math.random().toString(16).slice(2) + Date.now(); changed = true; }
    }
    if (changed) write(KEY, offers);
    return offers;
  }

  // ---------- UI ----------
  const grid = $("#marketGrid");
  const qSearch = $("#marketSearch");
  const fCat = $("#filterCategory");
  const fType = $("#filterType");
  const addBtn = $("#addOfferBtn");

  function getOffers() {
    return normalize(read(KEY, []));
  }

  function escapeHtml(s=""){
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function filterOffers(list) {
    const txt = (qSearch?.value || "").trim().toLowerCase();
    const cat = fCat?.value || "";
    const typ = fType?.value || "";
    return list.filter(o => {
      const textHit = !txt ||
        [o.title, o.desc, o.category, o.location].filter(Boolean).join(" ").toLowerCase().includes(txt);
      const catHit = !cat || o.category === cat;
      const typeHit = !typ || o.type === typ;
      return textHit && catHit && typeHit;
    });
  }

  function render() {
    if (!grid) return;
    const userId = uid();
    const offers = filterOffers(getOffers());

    if (offers.length === 0) {
      grid.innerHTML = `<div class="card" style="grid-column:1/-1">
        <div class="body"><p class="muted">Noch keine passenden Angebote. Erstelle das erste!</p></div>
      </div>`;
      return;
    }

    grid.innerHTML = offers.map(o => {
      const own = userId && o.uid && o.uid === userId;
      const img = o.imageDataUrl || o.image || "assets/img/offer_drill.jpg";
      const badgeType = o.type ? `<span class="badge">${o.type}</span>` : "";
      const badgeCat = o.category ? `<span class="badge">${o.category}</span>` : "";
      const loc = o.location ? `<div class="muted" style="font-size:.9rem;margin-top:6px;">📍 ${escapeHtml(o.location)}</div>` : "";
      const owner = o.ownerName ? `<div class="muted" style="font-size:.85rem;margin-top:2px;">von ${escapeHtml(o.ownerName)}</div>` : "";
      const actions = own ? `
        <div style="display:flex; gap:8px; margin-top:10px;">
          <button class="btn" data-action="edit-offer" data-id="${o.id}">Bearbeiten</button>
          <button class="btn" data-action="delete-offer" data-id="${o.id}">Löschen</button>
        </div>` : "";

      return `<article class="card">
        <div class="media"><img src="${img}" alt=""></div>
        <div class="body">
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
            ${badgeType}${badgeCat}
          </div>
          <h3 style="margin:0 0 6px 0">${escapeHtml(o.title || "Ohne Titel")}</h3>
          <p class="muted" style="min-height:2.6em">${escapeHtml((o.desc || "").slice(0,160))}${(o.desc||"").length>160?"…":""}</p>
          ${loc}
          ${owner}
          ${actions}
        </div>
      </article>`;
    }).join("");
  }

  // ---------- Events ----------
  if (qSearch) qSearch.addEventListener("input", render);
  if (fCat) fCat.addEventListener("change", render);
  if (fType) fType.addEventListener("change", render);

  // „Angebot einstellen“ (nur mit Login)
  function syncAddBtn() {
    if (!addBtn) return;
    const hasUser = !!uid();
    addBtn.disabled = !hasUser;
    addBtn.title = hasUser ? "Neues Angebot erstellen" : "Bitte erst mit Google einloggen";
  }
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (!uid()) { alert("Bitte erst mit Google einloggen."); return; }
      location.href = "offer-new.html";
    });
  }

  // Grid-Delegation für Edit/Löschen
  if (grid) {
    grid.addEventListener("click", async (e) => {
      const delBtn = e.target.closest('[data-action="delete-offer"]');
      const editBtn = e.target.closest('[data-action="edit-offer"]');

      if (delBtn) {
        const id = delBtn.getAttribute("data-id");
        const offers = getOffers();
        const offer = offers.find(x => x.id === id);

        if (!offer || !uid() || offer.uid !== uid()) {
          alert("Du kannst nur deine eigenen Angebote löschen.");
          return;
        }

        const ok = window.showConfirm
          ? await window.showConfirm("Möchtest du dein Angebot wirklich löschen? Das kann nicht rückgängig gemacht werden.", {
              title: "Wirklich löschen?",
              okText: "Ja, endgültig löschen",
              cancelText: "Abbrechen"
            })
          : window.confirm("Möchtest du dein Angebot wirklich löschen?");

        if (!ok) return;

        const next = offers.filter(x => x.id !== id);
        write(KEY, next);
        render();
      }

      if (editBtn) {
        const id = editBtn.getAttribute("data-id");
        location.href = `offer-new.html?id=${encodeURIComponent(id)}`;
      }
    });
  }

  // Login-Status
  window.addEventListener("auth-changed", () => {
    syncAddBtn();
    render();
  });

  // Init
  syncAddBtn();
  render();
})();
