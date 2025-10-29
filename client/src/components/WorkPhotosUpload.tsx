import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";

interface WorkPhotosUploadProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
}

export function WorkPhotosUpload({ photos, onPhotosChange, maxPhotos = 10 }: WorkPhotosUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Você pode adicionar no máximo ${maxPhotos} fotos`);
      return;
    }

    // Validar tamanho e tipo
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`${file.name} é muito grande. Máximo 10MB por foto.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Criar previews
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    onPhotosChange([...photos, ...validFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Fotos dos Seus Trabalhos</h3>
          <p className="text-sm text-muted-foreground">
            Adicione até {maxPhotos} fotos mostrando seus trabalhos realizados
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {photos.length}/{maxPhotos}
        </span>
      </div>

      {/* Grid de fotos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <Card key={index} className="relative group overflow-hidden aspect-square">
            <img 
              src={preview} 
              alt={`Trabalho ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </Card>
        ))}

        {/* Botão de adicionar */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          >
            <ImagePlus className="w-8 h-8" />
            <span className="text-sm font-medium">Adicionar Foto</span>
          </button>
        )}
      </div>

      {/* Input escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Dicas */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium">💡 Dicas para boas fotos:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use boa iluminação natural</li>
          <li>• Mostre o antes e depois quando possível</li>
          <li>• Foque nos detalhes do seu trabalho</li>
          <li>• Evite fotos borradas ou muito escuras</li>
        </ul>
      </div>
    </div>
  );
}

