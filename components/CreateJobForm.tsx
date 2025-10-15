"use client";

import { useState } from "react";
import { Plus, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function CreateJobForm() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    budget: "",
    description: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Auftrag erstellen:", formData);
    
    toast({
      title: "Auftrag gespeichert (Demo)",
      description: "Dein Auftrag wurde erfolgreich erstellt.",
    });

    // Reset form
    setFormData({
      title: "",
      category: "",
      budget: "",
      description: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">Auftrag erstellen</h3>
        <p className="text-gray-400">Beschreibe dein Projekt und finde den passenden Profi</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Titel des Auftrags"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-brand-500 focus:border-brand-500"
            required
          />
        </div>

        <div>
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="webdesign">Webdesign</SelectItem>
              <SelectItem value="handwerk">Handwerk</SelectItem>
              <SelectItem value="grafik">Grafikdesign</SelectItem>
              <SelectItem value="text">Texterstellung</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="beratung">Beratung</SelectItem>
              <SelectItem value="fotografie">Fotografie</SelectItem>
              <SelectItem value="übersetzung">Übersetzung</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={formData.budget} onValueChange={(value) => handleInputChange("budget", value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Budget-Bereich" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="50-250">50€ - 250€</SelectItem>
              <SelectItem value="250-500">250€ - 500€</SelectItem>
              <SelectItem value="500-1000">500€ - 1.000€</SelectItem>
              <SelectItem value="1000-2500">1.000€ - 2.500€</SelectItem>
              <SelectItem value="2500-5000">2.500€ - 5.000€</SelectItem>
              <SelectItem value="5000+">5.000€+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Textarea
            placeholder="Beschreibe dein Projekt im Detail..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-brand-500 focus:border-brand-500 min-h-[100px]"
            required
          />
        </div>

        <Button 
          type="submit" 
          variant="brand" 
          size="lg" 
          className="w-full"
          disabled={!formData.title || !formData.category || !formData.description}
        >
          <Plus className="w-4 h-4 mr-2" />
          Auftrag veröffentlichen
        </Button>
      </form>
    </div>
  );
}