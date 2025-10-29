import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface DocumentUploadProps {
  onUploaded: (documentBlob: Blob, documentUrl: string) => void;
  title?: string;
  description?: string;
  acceptedFormats?: string;
}

export function DocumentUpload({ 
  onUploaded, 
  title = "Upload de Documento",
  description = "Envie uma foto clara do seu RG ou CNH",
  acceptedFormats = "image/*"
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Apenas imagens são aceitas.");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast.success("Documento selecionado!");
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirm = () => {
    if (selectedFile && previewUrl) {
      onUploaded(selectedFile, previewUrl);
      toast.success("Documento enviado com sucesso!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-full max-w-md aspect-video border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ou arraste o arquivo aqui
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Documento"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRemove}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Remover
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-4 border-t space-y-1">
          <p>📋 <strong>Documentos aceitos:</strong></p>
          <p>• RG (Registro Geral)</p>
          <p>• CNH (Carteira de Motorista)</p>
          <p>• Máximo 10MB por arquivo</p>
          <p>• Foto clara e legível</p>
        </div>
      </CardContent>
    </Card>
  );
}

