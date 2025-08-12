// offer-new.js – Editor für Angebote (mit Preview & Draft)
(() => {
  const KEY = 'schlau_offers_v1';
  const DRAFT_KEY = 'draft_offer_v1';
  const $ = (s, r = document) => r.querySelector(s);

  const form = $('#offerForm');
  const loginBlock = $('#loginBlock');
  const editor = $('#editor');

  const dz = $('#dz'), pick = $('#pick'), image = $('#image');
  const previewImg = $('#preview');
  const pvImg = $('#pv_img');
  const pvMeta = $('#pv_meta');
  const pvTitle = $('#pv_title');
  const pvOwner = $('#pv_owner');
  const pvDesc = $('#pv_desc');
  const pvLoc  = $('#pv_loc');

  let imgDataUrl = '';

  function setLoggedInUI(user) {
    if (!user) { loginBlock.style.display = ''; editor.style.display = 'none'; }
    else { loginBlock.style.display = 'none'; editor.style.display = ''; pvOwner.textContent = `von ${user.displayName || 'Anonym'}`; }
  }
  function ensureAuth(){ setLoggedInUI(window.__authUser || null); }
  window.addEventListener('auth-changed', ensureAuth); ensureAuth();

  // Draft laden
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (draft && form) {
      Object.entries(draft).forEach(([k, v]) => { if (form.elements[k]) form.elements[k].value = v; });
      if (draft.imageDataUrl) showImage(draft.imageDataUrl);
    }
  } catch {}

  function showImage(src) {
    imgDataUrl = src || '';
    if (previewImg) { previewImg.src = src || ''; previewImg.style.display = src ? '' : 'none'; }
    if (pvImg) { pvImg.src = src || ''; pvImg.style.display = src ? '' : 'none'; }
  }
  async function handleFiles(files) {
    const f = files && files[0]; if (!f) return;
    if (!f.type.startsWith('image/')) { alert('Bitte ein Bild wählen.'); return; }
    const r = new FileReader();
    r.onload = () => { showImage(r.result); saveDraft(); };
    r.onerror = () => alert('Bild konnte nicht gelesen werden.');
    r.readAsDataURL(f);
  }
  pick && pick.addEventListener('click', () => image?.click());
  image && image.addEventListener('change', () => handleFiles(image.files));
  dz && ['dragover','drop'].forEach(evt => dz.addEventListener(evt, e => {
    e.preventDefault(); if (evt === 'drop') handleFiles(e.dataTransfer.files);
  }));

  function updatePreview() {
    const d = Object.fromEntries(new FormData(form));
    pvTitle.textContent = d.title || 'Titel deines Angebots';
    pvMeta.textContent  = `${d.category || 'Kategorie'} • ${d.type || 'Typ'}`;
    pvDesc.textContent  = d.desc || '';
    pvLoc.textContent   = '📍 ' + (d.location || '');
  }
  function saveDraft() {
    const obj = Object.fromEntries(new FormData(form));
    obj.imageDataUrl = imgDataUrl;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(obj));
  }
  form && form.addEventListener('input', () => { updatePreview(); saveDraft(); });

  form && form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = window.__authUser || null;
    if (!user) { alert('Bitte zuerst einloggen.'); return; }
    const d = Object.fromEntries(new FormData(form));
    const all = JSON.parse(localStorage.getItem(KEY) || '[]');
    all.unshift({
      id: crypto.randomUUID(),
      uid: user.uid,
      title: d.title,
      category: d.category,
      type: d.type,
      location: d.location,
      contact: d.contact,
      desc: d.desc || '',
      image: imgDataUrl,
      created: Date.now()
    });
    localStorage.setItem(KEY, JSON.stringify(all));
    localStorage.removeItem(DRAFT_KEY);
    alert('Angebot gespeichert!');
    location.href = 'index.html#market';
  });

  updatePreview();
})();
