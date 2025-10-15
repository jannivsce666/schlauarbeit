import { 
  signInWithPopup, 
  signInWithRedirect, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { saveUserProfile } from "./db";
import { isIOS } from "./utils";

export const signInWithGoogle = async () => {
  try {
    const ctx = await getFirebaseAuth();
    if (!ctx) {
      console.warn("Login deaktiviert: Firebase ENV Variablen fehlen (Demo-Modus)");
      return null;
    }
    const { auth, googleProvider } = ctx;
    if (isIOS()) {
      // Use redirect for iOS to avoid popup issues
      await signInWithRedirect(auth, googleProvider);
    } else {
      // Use popup for desktop
      const result = await signInWithPopup(auth, googleProvider);
      // Persist user profile in Realtime DB
      await saveUserProfile({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
      return result.user;
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const ctx = await getFirebaseAuth();
    if (!ctx) return;
    await firebaseSignOut(ctx.auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (typeof window === "undefined") return () => {};
  let unsub = () => {};
  getFirebaseAuth().then((ctx) => {
    if (ctx) {
      unsub = onAuthStateChanged(ctx.auth, callback);
    }
  });
  return () => unsub();
};