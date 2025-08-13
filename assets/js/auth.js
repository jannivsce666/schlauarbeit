// assets/js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD...DEINE",
  authDomain: "schlauarbeitneu.firebaseapp.com",
  projectId: "schlauarbeitneu",
  appId: "1:...:web:..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

await setPersistence(auth, browserLocalPersistence).catch(()=>{});

// UI
const $ = (s, r=document)=>r.querySelector(s);
const authArea = $('#authArea');

function renderLoggedOut() {
  authArea.innerHTML = `<button id="loginBtn" class="btn">Mit Google einloggen</button>`;
  $('#loginBtn').addEventListener('click', async () => {
    try {
      // Popups funktionieren am Desktop
      await signInWithPopup(auth, provider);
    } catch (e) {
      // Mobile/Safari: Redirect
      await signInWithRedirect(auth, provider);
    }
  });
}

function renderLoggedIn(user) {
  authArea.innerHTML = `
    <a class="btn" href="account.html">Mein Konto</a>
    <button id="logoutBtn" class="btn ghost">Logout</button>
  `;
  $('#logoutBtn').addEventListener('click', async () => {
    await signOut(auth);
    renderLoggedOut();
  });
}

// Redirect-Ergebnis verarbeiten (wichtig für iOS)
getRedirectResult(auth).catch(()=>{ /* ignorieren */ });

onAuthStateChanged(auth, (user) => {
  if (user) renderLoggedIn(user);
  else renderLoggedOut();
});
