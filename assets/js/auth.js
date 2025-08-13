// assets/js/auth.js
// Firebase Login (Popup + iOS/Safari-Redirect Fallback) + schlanke Header-UI

const authArea = document.getElementById("authArea");

// --- Deine Firebase-Config ---
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAucvfbAI9s10ak99I7YLAPb5VskQoOlNI",
  authDomain: "schlauarbeitneu.firebaseapp.com",
  projectId: "schlauarbeitneu",
  storageBucket: "schlauarbeitneu.appspot.com",
  messagingSenderId: "332216695076",
  appId: "1:332216695076:web:ed24bc7d079b8dcef92a71",
  measurementId: "G-Q2L5L6K4BW"
};

window.__authUser = null;
window.authSignIn = null;
window.authDeleteMe = null;

function isIOS() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS13 = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOS || iPadOS13;
}

(async function initAuth() {
  if (!FIREBASE_CONFIG?.apiKey) {
    if (authArea) authArea.innerHTML = '<span class="badge">Login optional</span>';
    return;
  }

  const { initializeApp } =
    await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
  const {
    getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
    getRedirectResult, onAuthStateChanged, signOut, deleteUser
  } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');

  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  // Login-Funktion mit Fallback
  window.authSignIn = async () => {
    try {
      if (isIOS()) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e) {
      // Fallback auf Redirect, wenn Popup blockiert wurde
      try { await signInWithRedirect(auth, provider); } catch {}
    }
  };

  // Konto endgültig löschen (inkl. lokale Inhalte entfernen, falls Export nicht gewünscht)
  window.authDeleteMe = async () => {
    if (!auth.currentUser) return;
    try {
      const uid = auth.currentUser.uid;
      if (typeof window.removeAllOffersByUid === "function") {
        window.removeAllOffersByUid(uid);
      }
      await deleteUser(auth.currentUser);
      alert("Dein Konto wurde gelöscht.");
    } catch (e) {
      alert("Konto konnte nicht gelöscht werden. Bitte nach erneutem Login erneut versuchen.");
    }
  };

  // Nach Redirect das Ergebnis einsammeln (iOS)
  try { await getRedirectResult(auth); } catch {}

  function render(user) {
    window.__authUser = user || null;
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: window.__authUser }));

    if (!authArea) return;
    if (user) {
      // Schlanke UI für Mobile: nur "Mein Konto" + Logout
      authArea.innerHTML = `
        <a class="btn" href="account.html">Mein Konto</a>
        <button class="btn" id="logoutBtn">Logout</button>
      `;
      document.getElementById("logoutBtn")?.addEventListener("click", () => signOut(auth));
    } else {
      authArea.innerHTML = `<button class="btn primary" id="loginBtn">Mit Google einloggen</button>`;
      document.getElementById("loginBtn")?.addEventListener("click", () => window.authSignIn());
    }
  }

  onAuthStateChanged(auth, render);
})();
