// Datei: assets/js/auth.js
// ES-Module: robuster Login (Popup + iOS-Redirect-Fallback) + Header-UI

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

/** Deine Firebase Konfiguration (aus der ZIP) */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAucvfbAI9s10ak99I7YLAPb5VskQoOlNI",
  authDomain: "schlauarbeitneu.firebaseapp.com",
  projectId: "schlauarbeitneu",
  storageBucket: "schlauarbeitneu.appspot.com",
  messagingSenderId: "332216695076",
  appId: "1:332216695076:web:ed24bc7d079b8dcef92a71",
  measurementId: "G-Q2L5L6K4BW",
};

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);

const provider = new GoogleAuthProvider();

/** Helpers */
const $ = (s, r = document) => r.querySelector(s);
const authArea = $("#authArea");

const isIOS = /iP(ad|hone|od)/i.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/** UI */
function render(user) {
  if (!authArea) return;

  if (!user) {
    authArea.innerHTML = `
      <button id="loginBtn" class="btn">Login</button>
    `;
    $("#loginBtn")?.addEventListener("click", signInSmart);
    return;
  }

  const name = user.displayName || "Mein Konto";
  authArea.innerHTML = `
    <a href="account.html" class="btn">${name.includes(" ") ? name.split(" ")[0] : name}</a>
    <button id="logoutBtn" class="btn ghost">Logout</button>
  `;
  $("#logoutBtn")?.addEventListener("click", async () => {
    try { await signOut(auth); } catch (e) { console.warn(e); }
  });
}

/** Login mit Fallback:
 * - iOS/Safari: signInWithRedirect (Popup wird oft geblockt)
 * - sonst: Popup zuerst, bei Fehler Redirect
 */
async function signInSmart() {
  try {
    if (isIOS || isSafari) {
      await signInWithRedirect(auth, provider);
      return;
    }
    await signInWithPopup(auth, provider);
  } catch (err) {
    // Popup geblockt → Redirect
    try {
      await signInWithRedirect(auth, provider);
    } catch (e) {
      console.error("Login fehlgeschlagen:", e);
      alert("Login konnte nicht gestartet werden. Bitte später erneut versuchen.");
    }
  }
}

/** Redirect-Ergebnis abholen (iOS/Safari) – still: keine UI-Blockade */
try {
  await getRedirectResult(auth);
} catch (e) {
  // nicht schlimm, nur zur Diagnose
  console.debug("getRedirectResult:", e?.message || e);
}

/** Live-Status hören */
onAuthStateChanged(auth, (user) => render(user));

/** Für andere Skripte verfügbar machen (z. B. marketplace.js) */
window.authGetUser = () => auth.currentUser;
window.authSignOut = () => signOut(auth);

