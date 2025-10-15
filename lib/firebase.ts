let _app: any;
let _auth: any;
let _googleProvider: any;

export async function getFirebaseAuth() {
  if (typeof window === "undefined") return null;

  if (_auth && _googleProvider) {
    return { auth: _auth, googleProvider: _googleProvider };
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  } as const;

  // Guard: don't init with empty envs
  if (!firebaseConfig.apiKey) {
    console.warn("Firebase: Fehlende ENV Variablen. Login ist deaktiviert (Demo).");
    return null;
  }

  const { initializeApp } = await import("firebase/app");
  const { getAuth, GoogleAuthProvider } = await import("firebase/auth");

  _app = _app ?? initializeApp(firebaseConfig);
  _auth = _auth ?? getAuth(_app);
  _googleProvider = _googleProvider ?? new GoogleAuthProvider();

  return { auth: _auth, googleProvider: _googleProvider };
}

export default null;