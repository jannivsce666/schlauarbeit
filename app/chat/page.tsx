"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { User } from "firebase/auth";
import { onAuthStateChange } from "@/lib/auth";
import { fetchAllUsers, isOwner, type AppUser } from "@/lib/db";
import {
  ensureConversation,
  listenConversationsForUser,
  listenMessages,
  markRead,
  sendMessage,
  type ChatMessage,
  type ConversationMeta,
  getUserProfile,
} from "@/lib/chat";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  online: boolean;
}

const dummyConversations: Conversation[] = [
  {
    id: "1",
    name: "Max Weber",
    lastMessage: "Perfekt! Wann können wir starten?",
    timestamp: "vor 5 Min",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Lisa Schmidt",
    lastMessage: "Die Designs sehen fantastisch aus",
    timestamp: "vor 1 Std",
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Thomas Klein",
    lastMessage: "Danke für das schnelle Angebot",
    timestamp: "vor 3 Std",
    unread: 1,
    online: false,
  },
  {
    id: "4",
    name: "Anna Müller",
    lastMessage: "Können wir heute telefonieren?",
    timestamp: "Gestern",
    unread: 0,
    online: false,
  },
];

  export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [ownerView, setOwnerView] = useState(false);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [conversationsMap, setConversationsMap] = useState<Record<string, ConversationMeta>>({});
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

    // Subscribe to auth; if owner, fetch all users
    useEffect(() => {
      // Fail-safe to exit loading state in demo mode (no Firebase env)
      const failSafe = setTimeout(() => setLoading(false), 1200);
      const unsub = onAuthStateChange(async (u) => {
        clearTimeout(failSafe);
        setCurrentUser(u);
        if (u) {
          const isOwnerUser = await isOwner(u.uid);
          setOwnerView(isOwnerUser);
          if (isOwnerUser) {
            const list = await fetchAllUsers();
            // Exclude self from list
            setUsers(list.filter((x) => x.uid !== u.uid));
          } else {
            setUsers([]);
          }
          // Subscribe to this user's conversations
          const stop = await listenConversationsForUser(u.uid, (convs) => {
            setConversationsMap(convs);
          });
          // Return a cleanup for the inner subscription
          return () => {
            if (typeof stop === "function") stop();
          };
        } else {
          setOwnerView(false);
          setUsers([]);
        }
        setLoading(false);
      });
      return () => {
        clearTimeout(failSafe);
        unsub();
      };
    }, []);

    // Subscribe to messages of the selected conversation
    useEffect(() => {
      if (!selectedChat || !currentUser) return;
      const chatId = selectedChat;
      let unsubscribe: undefined | (() => void);
      (async () => {
        unsubscribe = await listenMessages(chatId, (msg) => {
          setMessages((prev) => ({
            ...prev,
            [chatId]: [ ...(prev[chatId] || []), msg ],
          }));
          if (msg.to === currentUser.uid) {
            // mark as read when receiving a message
            markRead(chatId, currentUser.uid);
          }
        });
      })();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [selectedChat, currentUser]);

    const conversationList: Conversation[] = useMemo(() => {
      if (currentUser && Object.keys(conversationsMap).length > 0) {
        const items: Conversation[] = [];
        for (const [cid, meta] of Object.entries(conversationsMap)) {
          const partnerId = Object.keys(meta.participants || {}).find((id) => id !== currentUser.uid);
          if (!partnerId) continue;
          const partnerProfile = users.find((u) => u.uid === partnerId);
          items.push({
            id: cid,
            name: partnerProfile?.displayName || partnerProfile?.email || partnerId,
            lastMessage: meta.lastMessage || "",
            timestamp: meta.lastMessageTime ? new Date(meta.lastMessageTime).toLocaleTimeString() : "",
            unread: 0,
            avatar: partnerProfile?.photoURL || undefined,
            online: false,
          });
        }
        return items.sort((a, b) => (conversationsMap[b.id]?.lastMessageTime || 0) - (conversationsMap[a.id]?.lastMessageTime || 0));
      }
      if (ownerView) {
        return users.map((u) => ({
          id: u.uid,
          name: u.displayName || u.email || "Unbekannt",
          lastMessage: u.email || "",
          timestamp: "",
          unread: 0,
          avatar: u.photoURL || undefined,
          online: false,
        }));
      }
      return dummyConversations;
    }, [currentUser, conversationsMap, ownerView, users]);

    const filteredConversations = useMemo(() => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return conversationList;
      return conversationList.filter((c) => c.name.toLowerCase().includes(q));
    }, [conversationList, searchTerm]);

    const selectedConversation = useMemo(
      () => conversationList.find((c) => c.id === selectedChat) || null,
      [conversationList, selectedChat]
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/" className="text-green-700 hover:text-green-900">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück zur Startseite
                  </Link>
                </Button>
                <h1 className="text-xl font-semibold text-green-900 flex items-center gap-2">
                  Chat
                  {ownerView && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-700 border border-brand-500/40 shadow-sm">
                      Owner-Ansicht
                    </span>
                  )}
                </h1>
              </div>

              <div className="text-brand-600 font-medium">Schlauarbeit</div>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar - Conversation List */}
          <div className="w-80 border-r border-green-200/50 bg-white/40 backdrop-blur-2xl shadow-lg">
            {/* Search */}
            <div className="p-4 border-b border-green-200/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4" />
                <Input
                  placeholder="Chats durchsuchen..."
                  className="pl-10 bg-white/50 border-green-200 text-green-900 placeholder:text-green-600 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="overflow-y-auto">
              {loading && (
                <div className="p-4 text-sm text-green-600">Lade Chats…</div>
              )}
              {!loading && filteredConversations.length === 0 && (
                <div className="p-4 text-sm text-green-600">
                  {ownerView
                    ? "Keine Nutzer gefunden."
                    : "Keine Unterhaltungen gefunden."}
                </div>
              )}
              {!loading &&
                filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ x: 4 }}
                    className={`p-4 border-b border-green-200/30 cursor-pointer transition-colors ${
                      selectedChat === conversation.id
                        ? "bg-brand-500/20 border-l-4 border-l-brand-500 shadow-md"
                        : "hover:bg-white/50"
                    }`}
                    onClick={async () => {
                      if (!currentUser) return;
                      // If id looks like a UID (no underscore), create/find a conversation with that user
                      if (!conversation.id.includes("_")) {
                        const cid = await ensureConversation(currentUser.uid, conversation.id);
                        setSelectedChat(cid);
                      } else {
                        setSelectedChat(conversation.id);
                      }
                      // Preload partner profile if not present
                      const partnerId = conversation.id.includes("_")
                        ? conversation.id.split("_").find((x) => x !== currentUser.uid)
                        : conversation.id;
                      if (partnerId && !users.find((u) => u.uid === partnerId)) {
                        const prof = await getUserProfile(partnerId);
                        if (prof) setUsers((prev) => [...prev.filter((u) => u.uid !== prof.uid), prof as AppUser]);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {conversation.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={conversation.avatar}
                            alt={conversation.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {conversation.name.charAt(0)}
                          </div>
                        )}
                        {conversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-green-900 truncate">
                            {conversation.name}
                          </h3>
                          {conversation.timestamp && (
                            <span className="text-xs text-green-600">
                              {conversation.timestamp}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-green-600 truncate">
                          {conversation.lastMessage || (ownerView ? "Profil öffnen" : "Öffnen")}
                        </p>
                      </div>

                      {conversation.unread > 0 && (
                        <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {conversation.unread}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-green-200/50 bg-white/40 backdrop-blur-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {selectedConversation.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={selectedConversation.avatar}
                            alt={selectedConversation.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {selectedConversation.name.charAt(0)}
                          </div>
                        )}
                        {selectedConversation.online && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-gray-900" />
                        )}
                      </div>
                      <div>
                        <h2 className="font-medium text-green-900">
                          {selectedConversation.name}
                        </h2>
                        <p className="text-sm text-green-600">
                          {selectedConversation.online ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-green-50/50 to-emerald-50/80">
                  <div className="space-y-4">
                    {(
                      (selectedChat ? (messages[selectedChat] || []) : []) as ChatMessage[]
                    ).map((m: ChatMessage) => {
                      const mine = currentUser && m.from === currentUser.uid;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <Card className={`max-w-xs ${mine ? "bg-brand-500/30 border-brand-500/50 shadow-lg shadow-brand-400/20" : "bg-white/60 border-green-200 shadow-lg"} p-3 backdrop-blur-xl`}>
                            <p className="text-green-900 text-sm">{m.text}</p>
                            <span className="text-xs text-green-600 mt-1 block">
                              {typeof m.timestamp === "number" ? new Date(m.timestamp).toLocaleTimeString() : ""}
                            </span>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-green-200/50 bg-white/40 backdrop-blur-2xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>

                    <div className="flex-1 relative">
                      <Input
                        placeholder="Nachricht eingeben..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="pr-10 bg-white/50 border-green-200 text-green-900 placeholder:text-green-600 shadow-sm"
                        onKeyPress={async (e) => {
                          if (e.key === "Enter" && message.trim() && currentUser && selectedChat) {
                            const partnerId = selectedChat.split("_").find((x) => x !== currentUser.uid) || "";
                            await sendMessage(selectedChat, currentUser.uid, partnerId, message.trim());
                            await markRead(selectedChat, currentUser.uid);
                            setMessage("");
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant="brand"
                      size="sm"
                      disabled={!message.trim()}
                      onClick={async () => {
                        if (!message.trim() || !currentUser || !selectedChat) return;
                        const partnerId = selectedChat.split("_").find((x) => x !== currentUser.uid) || "";
                        await sendMessage(selectedChat, currentUser.uid, partnerId, message.trim());
                        await markRead(selectedChat, currentUser.uid);
                        setMessage("");
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* No Chat Selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-brand-500/20 rounded-full flex items-center justify-center shadow-lg shadow-brand-400/30">
                    <MessageCircle className="w-8 h-8 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-900 mb-2">
                      Wähle eine Unterhaltung
                    </h3>
                    <p className="text-green-700">
                      {ownerView
                        ? "Klicke links auf einen Nutzer, um sein Profil zu öffnen"
                        : "Klicke auf einen Chat links, um loszulegen"}
                    </p>
                    {!currentUser && (
                      <p className="text-xs text-green-600 mt-2">
                        Tipp: Melde dich mit Google an (Tab "Login" auf der Startseite),
                        um die Owner-Ansicht zu testen.
                      </p>
                    )}
                    {currentUser && !ownerView && (
                      <p className="text-xs text-green-600 mt-2">
                        Du bist nicht als Owner markiert. Kontaktiere den Administrator,
                        um Zugriff auf die Nutzerliste zu erhalten.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }