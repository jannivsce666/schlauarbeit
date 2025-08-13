// assets/js/confirm.js
(() => {
  const dlg = document.getElementById('confirmDialog');
  const form = document.getElementById('confirmForm');
  const msg = document.getElementById('confirmMessage');
  const yesBtn = document.getElementById('confirmYesBtn');

  if (!dlg || !form || !msg || !yesBtn) {
    // Fallback: nutze window.confirm
    window.confirmAction = async (text) => window.confirm(text);
    return;
  }

  let resolver = null;

  form.addEventListener('close', () => {
    if (resolver) { resolver(form.returnValue === 'confirm'); resolver = null; }
  });

  yesBtn.addEventListener('click', () => {
    form.returnValue = 'confirm';
    dlg.close();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    dlg.close(); // 'cancel' by default
  });

  window.confirmAction = (text = 'Bist du sicher?') => {
    msg.textContent = text;
    dlg.showModal();
    return new Promise((resolve) => { resolver = resolve; });
  };
})();
