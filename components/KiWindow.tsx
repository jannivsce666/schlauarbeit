"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Upload, LogIn, MessageCircle } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { CreateJobForm } from "./CreateJobForm";
import { ImageDropzone } from "./ImageDropzone";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { ChatCTA } from "./ChatCTA";

export function KiWindow() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* Glassmorphism Card */}
      <Card className="glass-strong border-white/70 bg-white/50 backdrop-blur-3xl relative overflow-hidden shadow-2xl shadow-brand-400/30">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-300/20 via-emerald-200/10 to-teal-300/20 pointer-events-none" />
        
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-brand-400/30 via-emerald-400/30 to-brand-400/30 opacity-50 animate-pulse" style={{
          background: "linear-gradient(45deg, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.3) 50%, rgba(34, 197, 94, 0.3) 100%)",
          animation: "shimmer 3s ease-in-out infinite"
        }} />
        
        <div className="relative z-10 p-8">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/30 backdrop-blur-xl border border-white/40 shadow-lg">
              <TabsTrigger 
                value="search" 
                className="data-[state=active]:bg-brand-500/30 data-[state=active]:text-brand-700 data-[state=active]:shadow-lg flex items-center gap-2 text-green-700"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Suchen</span>
              </TabsTrigger>
              <TabsTrigger 
                value="job" 
                className="data-[state=active]:bg-brand-500/30 data-[state=active]:text-brand-700 data-[state=active]:shadow-lg flex items-center gap-2 text-green-700"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Auftrag</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-brand-500/30 data-[state=active]:text-brand-700 data-[state=active]:shadow-lg flex items-center gap-2 text-green-700"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bild</span>
              </TabsTrigger>
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-brand-500/30 data-[state=active]:text-brand-700 data-[state=active]:shadow-lg flex items-center gap-2 text-green-700"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-brand-500/30 data-[state=active]:text-brand-700 data-[state=active]:shadow-lg flex items-center gap-2 text-green-700"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <SearchBar />
            </TabsContent>

            <TabsContent value="job" className="space-y-4">
              <CreateJobForm />
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <ImageDropzone />
            </TabsContent>

            <TabsContent value="login" className="space-y-4">
              <GoogleLoginButton />
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <ChatCTA />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </motion.div>
  );
}