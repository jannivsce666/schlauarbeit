"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatCTA() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">Chat starten</h3>
        <p className="text-gray-400">Kommuniziere direkt mit Dienstleistern</p>
      </div>

      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-brand-400" />
        </div>
        
        <div className="space-y-2">
          <p className="text-white">
            Tausche dich in Echtzeit mit Profis aus
          </p>
          <p className="text-gray-400 text-sm">
            Stelle Fragen, kläre Details und finde den perfekten Match
          </p>
        </div>

        <Button asChild variant="brand" size="lg" className="w-full group">
          <Link href="/chat" className="flex items-center justify-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Zum Chatbereich
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>

      <div className="text-center">
        <p className="text-gray-400 text-xs">
          Sicher verschlüsselt • Spam-Schutz • 24/7 verfügbar
        </p>
      </div>
    </div>
  );
}