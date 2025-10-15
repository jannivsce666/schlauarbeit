"use client";

import { getFirebaseAuth } from "./firebase";

export type AppUser = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  createdAt?: number;
};

export async function saveUserProfile(user: AppUser) {
  const ctx = await getFirebaseAuth();
  if (!ctx) return;
  const { db } = ctx;
  const { ref, set } = await import("firebase/database");
  const userRef = ref(db, `users/${user.uid}`);
  await set(userRef, {
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    photoURL: user.photoURL ?? null,
    createdAt: user.createdAt ?? Date.now(),
  });
}

export async function fetchAllUsers(): Promise<AppUser[]> {
  const ctx = await getFirebaseAuth();
  if (!ctx) return [];
  const { db } = ctx;
  const { ref, get, child } = await import("firebase/database");
  const snapshot = await get(child(ref(db), "users"));
  if (!snapshot.exists()) return [];
  const val = snapshot.val() as Record<string, any>;
  return Object.entries(val).map(([uid, data]) => ({ uid, ...data }));
}

export async function isOwner(uid: string): Promise<boolean> {
  const ctx = await getFirebaseAuth();
  if (!ctx) return false;
  const { db } = ctx;
  const { ref, get, child } = await import("firebase/database");
  const snap = await get(child(ref(db), `roles/${uid}`));
  if (!snap.exists()) return false;
  const role = snap.val();
  return role === "owner" || role?.role === "owner";
}
