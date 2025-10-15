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
      <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-brand-500/20 opacity-0 animate-pulse" style={{
          background: "linear-gradient(45deg, rgba(16, 185, 129, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(16, 185, 129, 0.2) 100%)",
          animation: "shimmer 3s ease-in-out infinite"
        }} />
        
        <div className="relative z-10 p-8">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/5 backdrop-blur-sm border border-white/10">
              <TabsTrigger 
                value="search" 
                className="data-[state=active]:bg-brand-500/20 data-[state=active]:text-brand-400 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Suchen</span>
              </TabsTrigger>
              <TabsTrigger 
                value="job" 
                className="data-[state=active]:bg-brand-500/20 data-[state=active]:text-brand-400 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Auftrag</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-brand-500/20 data-[state=active]:text-brand-400 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bild</span>
              </TabsTrigger>
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-brand-500/20 data-[state=active]:text-brand-400 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-brand-500/20 data-[state=active]:text-brand-400 flex items-center gap-2"
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