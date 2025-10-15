"use client";

import { getFirebaseAuth } from "./firebase";

export type ChatMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp?: number | null;
};

export type ConversationMeta = {
  lastMessage?: string;
  lastMessageTime?: number;
  lastSender?: string;
  participants: Record<string, true>;
};

export function conversationId(a: string, b: string) {
  return [a, b].sort().join("_");
}

export async function getUserProfile(uid: string) {
  const ctx = await getFirebaseAuth();
  if (!ctx) return null;
  const { db } = ctx;
  const { ref, get, child } = await import("firebase/database");
  const snap = await get(child(ref(db), `users/${uid}`));
  return snap.exists() ? { uid, ...(snap.val() as any) } : { uid };
}

export async function ensureConversation(a: string, b: string) {
  const ctx = await getFirebaseAuth();
  if (!ctx) throw new Error("Firebase not initialized");
  const { db } = ctx;
  const { ref, update } = await import("firebase/database");
  const cid = conversationId(a, b);
  const updates: Record<string, any> = {};
  updates[`conversations/${cid}/participants/${a}`] = true;
  updates[`conversations/${cid}/participants/${b}`] = true;
  await update(ref(db), updates);
  return cid;
}

export async function sendMessage(cid: string, from: string, to: string, text: string) {
  const ctx = await getFirebaseAuth();
  if (!ctx) throw new Error("Firebase not initialized");
  const { db } = ctx;
  const { ref, update, push, serverTimestamp } = await import("firebase/database");
  const baseRef = ref(db);
  const msgKey = push(ref(db, `messages/${cid}`)).key;
  if (!msgKey) throw new Error("Failed to allocate message key");
  const payload = {
    from,
    to,
    text,
    timestamp: serverTimestamp(),
  };
  const updates: Record<string, any> = {};
  updates[`messages/${cid}/${msgKey}`] = payload;
  updates[`conversations/${cid}/lastMessage`] = text;
  updates[`conversations/${cid}/lastMessageTime`] = serverTimestamp();
  updates[`conversations/${cid}/lastSender`] = from;
  updates[`conversations/${cid}/participants/${from}`] = true;
  updates[`conversations/${cid}/participants/${to}`] = true;
  await update(baseRef, updates);
}

export async function markRead(cid: string, uid: string) {
  const ctx = await getFirebaseAuth();
  if (!ctx) return;
  const { db } = ctx;
  const { ref, set, serverTimestamp } = await import("firebase/database");
  await set(ref(db, `conversations/${cid}/reads/${uid}`), serverTimestamp());
}

export async function listenMessages(
  cid: string,
  onAdd: (msg: ChatMessage) => void,
) {
  const ctx = await getFirebaseAuth();
  if (!ctx) return () => {};
  const { db } = ctx;
  const { ref, query, limitToLast, onChildAdded, off } = await import("firebase/database");
  const q = query(ref(db, `messages/${cid}`), limitToLast(200));
  const handler = onChildAdded(q, (snap) => {
    const val = snap.val();
    if (val && typeof val.text === "string") {
      onAdd({ id: snap.key || "", ...val });
    }
  });
  return () => off(q, "child_added", handler as any);
}

export async function listenConversationsForUser(
  uid: string,
  onChange: (convs: Record<string, ConversationMeta>) => void,
) {
  const ctx = await getFirebaseAuth();
  if (!ctx) return () => {};
  const { db } = ctx;
  const { ref, query, orderByChild, equalTo, onValue, off } = await import("firebase/database");
  const q = query(ref(db, "conversations"), orderByChild(`participants/${uid}`), equalTo(true));
  const unsub = onValue(q, (snap) => {
    onChange((snap.val() as any) || {});
  });
  return () => off(q, "value", unsub as any);
}
