// guide-new.js – Editor für Anleitungen (mit Live-Vorschau & Draft)
(() => {
  const KEY = 'schlau_guides_v1';
  const DRAFT_KEY = 'draft_guide_v1';
  const $ = (s, r = document) => r.querySelector(s);

  const form = $('#guideForm');
  const loginBlock = $('#loginBlock');
  const editor = $('#editor');

  const dz = $('#dz'), pick = $('#pick'), image = $('#image');
  const previewImg = $('#preview');     // im Dropzone
  const pvImg = $('#pv_img');           // in der Karte
  const pvMeta = $('#pv_meta');
  const pvTitle = $('#pv_title');
  const pvOwner = $('#pv_owner');
  const pvContent = $('#pv_content');

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

  // Toolbar
  document.querySelectorAll('[data-md]').forEach(btn => {
    btn.addEventListener('click', () => {
      const token = btn.getAttribute('data-md');
      const ta = form.steps;
      const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
      let insert = token;
      if (token === 'h3') insert = `### ${sel || ''}`;
      else if (token === '**bold**') insert = `**${sel || 'Text'}**`;
      else if (token === '- ') insert = `- ${sel || 'Listeneintrag'}`;
      ta.setRangeText(insert, ta.selectionStart, ta.selectionEnd, 'end');
      updatePreview(); saveDraft();
    });
  });

  // Bild
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

  // Preview
  function md(s = '') {
    return s
      .replace(/^### (.*)$/gim, '<h3>$1</h3>')
      .replace(/^## (.*)$/gim, '<h2>$1</h2>')
      .replace(/^# (.*)$/gim, '<h1>$1</h1>')
      .replace(/^- (.*)$/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
  }
  function updatePreview() {
    const data = Object.fromEntries(new FormData(form));
    pvTitle.textContent = data.title || 'Titel deiner Anleitung';
    pvMeta.textContent = `${data.category || 'Kategorie'} • ${data.difficulty || 'Schwierigkeit'}${data.hours ? ` • ~${data.hours}h` : ''}`;
    pvContent.innerHTML = `<p><strong>Materialien:</strong> ${data.materials || '-'}</p>${md(data.steps || '')}`;
  }
  function saveDraft() {
    const obj = Object.fromEntries(new FormData(form));
    obj.imageDataUrl = imgDataUrl;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(obj));
  }
  form && form.addEventListener('input', () => { updatePreview(); saveDraft(); });

  // Submit
  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = window.__authUser || null;
    if (!user) { alert('Bitte zuerst einloggen.'); return; }
    const data = Object.fromEntries(new FormData(form));
    const all = JSON.parse(localStorage.getItem(KEY) || '[]');
    all.unshift({
      id: crypto.randomUUID(),
      uid: user.uid,
      title: data.title,
      category: data.category,
      difficulty: data.difficulty,
      hours: data.hours,
      materials: data.materials,
      steps: data.steps,
      image: imgDataUrl,
      created: Date.now()
    });
    localStorage.setItem(KEY, JSON.stringify(all));
    localStorage.removeItem(DRAFT_KEY);
    alert('Anleitung gespeichert!');
    location.href = 'index.html#guides';
  });

  updatePreview();
})();
