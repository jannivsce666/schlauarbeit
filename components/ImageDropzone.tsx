"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImageDropzone() {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        newImages.push(url);
      }
    });

    setPreviewImages(prev => [...prev, ...newImages]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index]); // Clean up object URL
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">Bild hochladen</h3>
        <p className="text-gray-400">Lade Bilder für dein Projekt hoch</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-brand-500 bg-brand-500/10"
            : "border-white/30 hover:border-white/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-brand-400" />
          </div>
          
          <div>
            <p className="text-white font-medium">
              Dateien hier ablegen oder klicken zum Auswählen
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Unterstützte Formate: JPG, PNG, GIF (max. 10MB)
            </p>
          </div>
          
          <Button variant="glass" size="lg" asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              <ImageIcon className="w-4 h-4 mr-2" />
              Bilder auswählen
            </label>
          </Button>
        </div>
      </div>

      {/* Preview Images */}
      {previewImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-white font-medium">Vorschau:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previewImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Bild entfernen"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}