"use client";

import { useState } from "react";
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
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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

  const selectedConversation = dummyConversations.find(c => c.id === selectedChat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="text-gray-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück zur Startseite
                </Link>
              </Button>
              <h1 className="text-xl font-semibold text-white">Chat</h1>
            </div>
            
            <div className="text-brand-400 font-medium">
              Schlauarbeit
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Conversation List */}
        <div className="w-80 border-r border-white/10 bg-black/20 backdrop-blur-xl">
          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Chats durchsuchen..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="overflow-y-auto">
            {dummyConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ x: 4 }}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                  selectedChat === conversation.id
                    ? "bg-brand-500/20 border-l-4 border-l-brand-500"
                    : "hover:bg-white/5"
                }`}
                onClick={() => setSelectedChat(conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.name.charAt(0)}
                    </div>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-white truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {conversation.lastMessage}
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
              <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedConversation.name.charAt(0)}
                      </div>
                      {selectedConversation.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-gray-900" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-medium text-white">
                        {selectedConversation.name}
                      </h2>
                      <p className="text-sm text-gray-400">
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
              <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-transparent to-black/20">
                <div className="space-y-4">
                  {/* Demo Messages */}
                  <div className="flex justify-start">
                    <Card className="max-w-xs glass-card p-3">
                      <p className="text-white text-sm">
                        Hallo! Ich habe dein Profil gesehen und bin interessiert an deinen Services.
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        vor 2 Std
                      </span>
                    </Card>
                  </div>
                  
                  <div className="flex justify-end">
                    <Card className="max-w-xs bg-brand-500/20 border-brand-500/30 p-3">
                      <p className="text-white text-sm">
                        Hallo! Gerne können wir über dein Projekt sprechen. Was schwebt dir vor?
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        vor 2 Std
                      </span>
                    </Card>
                  </div>

                  <div className="flex justify-start">
                    <Card className="max-w-xs glass-card p-3">
                      <p className="text-white text-sm">
                        {selectedConversation.lastMessage}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {selectedConversation.timestamp}
                      </span>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Nachricht eingeben..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && message.trim()) {
                          console.log("Nachricht senden:", message);
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
                    onClick={() => {
                      if (message.trim()) {
                        console.log("Nachricht senden:", message);
                        setMessage("");
                      }
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
                <div className="w-16 h-16 mx-auto bg-brand-500/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Wähle eine Unterhaltung
                  </h3>
                  <p className="text-gray-400">
                    Klicke auf einen Chat links, um loszulegen
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}