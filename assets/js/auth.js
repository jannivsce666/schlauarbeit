// auth.js – Firebase optional; sonst Mock-Login
(() => {
  const ADMIN_EMAILS = []; // optional
  const MOCK_KEY = 'mock_user';
  const $ = (s, r = document) => r.querySelector(s);

  function renderAuth() {
    const area = $('#authArea');
    if (!area) return;
    if (window.__authUser) {
      area.innerHTML = `
        <a href="account.html" class="btn">Mein Konto</a>
        <button class="btn ghost" id="logoutBtn">Logout</button>`;
      $('#logoutBtn')?.addEventListener('click', logout);
    } else {
      area.innerHTML = `<button class="btn primary" id="loginBtn">Mit Google einloggen</button>`;
      $('#loginBtn')?.addEventListener('click', login);
    }
  }

  function emit(user) {
    window.__authUser = user;
    window.__isAdmin = !!(user && ADMIN_EMAILS.includes(user.email));
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
    renderAuth();
  }

  async function ensureFirebase() {
    if (window.firebase?.apps?.length) return true;
    if (!window.__FIREBASE_CONFIG) return false;
    const add = (src) => new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    await add('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
    await add('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js');
    firebase.initializeApp(window.__FIREBASE_CONFIG);
    return true;
  }

  async function login() {
    if (await ensureFirebase()) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const cred = await firebase.auth().signInWithPopup(provider);
        const u = cred.user;
        emit({ uid: u.uid, displayName: u.displayName || 'User', email: u.email || '', photoURL: u.photoURL || '' });
        return;
      } catch (e) { alert('Login fehlgeschlagen: ' + (e?.message || e)); }
    }
    // Mock
    const u = { uid: crypto.randomUUID(), displayName: 'Demo User', email: '' };
    sessionStorage.setItem(MOCK_KEY, JSON.stringify(u));
    emit(u);
  }

  async function logout() {
    if (window.firebase?.auth) { try { await firebase.auth().signOut(); } catch {} }
    sessionStorage.removeItem(MOCK_KEY);
    emit(null);
  }

  (async () => {
    if (await ensureFirebase()) {
      firebase.auth().onAuthStateChanged((u) => {
        emit(u ? { uid: u.uid, displayName: u.displayName || 'User', email: u.email || '', photoURL: u.photoURL || '' } : null);
      });
    } else {
      let u = null; try { u = JSON.parse(sessionStorage.getItem(MOCK_KEY) || 'null'); } catch {}
      emit(u);
    }
  })();

  // Für Buttons in deinen Seiten:
  window.authSignIn = login;
  window.authSignOut = logout;

  renderAuth();
})();
