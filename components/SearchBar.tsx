"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Suche:", { query, location });
    // Hier würde die echte Suchlogik implementiert werden
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Dienstleister finden</h3>
        <p className="text-gray-600">Suche nach Profis in deiner Nähe</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Was suchst du? (z.B. Klempner, Webdesigner...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="pl-10 bg-white/50 border-gray-300 text-gray-900">
                <SelectValue placeholder="Standort wählen" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="berlin">Berlin</SelectItem>
                <SelectItem value="hamburg">Hamburg</SelectItem>
                <SelectItem value="muenchen">München</SelectItem>
                <SelectItem value="koeln">Köln</SelectItem>
                <SelectItem value="frankfurt">Frankfurt</SelectItem>
                <SelectItem value="duesseldorf">Düsseldorf</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="brand" 
          size="lg" 
          className="w-full"
          disabled={!query.trim()}
        >
          <Search className="w-4 h-4 mr-2" />
          Suchen
        </Button>
      </form>
    </div>
  );
}