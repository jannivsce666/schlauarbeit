let _app: any;
let _auth: any;
let _googleProvider: any;
let _db: any;

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
  const { getDatabase } = await import("firebase/database");

  _app = _app ?? initializeApp(firebaseConfig);
  _auth = _auth ?? getAuth(_app);
  _googleProvider = _googleProvider ?? new GoogleAuthProvider();
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  _db = _db ?? (dbUrl ? getDatabase(_app, dbUrl) : getDatabase(_app));

  return { auth: _auth, googleProvider: _googleProvider, db: _db };
}

export default null;