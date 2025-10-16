"use client";

import { motion } from "framer-motion";
import { KiWindow } from "@/components/KiWindow";
import { Sparkles, Zap, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Animated spotlight */}
        <motion.div
          className="absolute inset-0 spotlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          style={{
            "--mouse-x": "50%",
            "--mouse-y": "50%",
          } as React.CSSProperties}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => {
            const hasWindow = typeof window !== "undefined";
            const startX = hasWindow ? Math.random() * window.innerWidth : Math.random() * 100;
            const startY = hasWindow ? Math.random() * window.innerHeight : Math.random() * 100;
            const endY = hasWindow ? Math.random() * window.innerHeight : startY + Math.random() * 50;

            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-brand-500 rounded-full shadow-lg shadow-brand-400"
                style={{
                  left: hasWindow ? undefined : `${startX}%`,
                  top: hasWindow ? undefined : `${startY}%`,
                }}
                initial={{
                  x: hasWindow ? startX : 0,
                  y: hasWindow ? startY : 0,
                  opacity: 0,
                }}
                animate={{
                  y: hasWindow ? endY : 0,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-8">
          <nav className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-gray-900"
            >
              Schlauarbeit
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex space-x-6 text-gray-700 font-medium"
            >
              <a href="#" className="hover:text-green-600 transition-colors">Für Profis</a>
              <a href="#" className="hover:text-green-600 transition-colors">Hilfe</a>
              <a href="#" className="hover:text-green-600 transition-colors">Kontakt</a>
            </motion.div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-12 lg:py-20">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 drop-shadow-sm"
            >
              Schlauarbeit – Finde Profis.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Erledige Aufträge.
              </span>{" "}
              Mit KI-Speed.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-700 max-w-3xl mx-auto mb-12"
            >
              Suche Dienstleister, erstelle Aufträge, lade Bilder hoch und chatte – 
              alles in einem modernen Interface.
            </motion.p>

            {/* Feature Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center space-x-8 mb-16"
            >
              <div className="flex items-center space-x-2 text-green-700">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold">KI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-green-700">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-semibold">Blitzschnell</span>
              </div>
              <div className="flex items-center space-x-2 text-green-700">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-semibold">Sicher</span>
              </div>
            </motion.div>
          </div>

          {/* KI Window */}
          <KiWindow />
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 mt-20">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Schlauarbeit. Alle Rechte vorbehalten.</p>
            <div className="mt-4 space-x-6">
              <a href="#" className="hover:text-brand-400 transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-brand-400 transition-colors">Impressum</a>
              <a href="#" className="hover:text-brand-400 transition-colors">AGB</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}