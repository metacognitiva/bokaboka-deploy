import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';

export default function UploadStory() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const createStory = trpc.stories.create.useMutation({
    onSuccess: () => {
      toast.success('Story publicado com sucesso!');
      setLocation('/');
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Formato inválido! Use JPG, PNG, WEBP, MP4 ou WEBM');
      return;
    }
    
    // Validar tamanho (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('Arquivo muito grande! Máximo 50MB');
      return;
    }
    
    // Validar duração do vídeo (20s)
    if (selectedFile.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 20) {
          toast.error('Vídeo muito longo! Máximo 20 segundos');
          setFile(null);
          setPreview('');
          return;
        }
      };
      
      video.src = URL.createObjectURL(selectedFile);
    }
    
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };
  
  const handleRemoveFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview('');
  };
  
  const handleSubmit = async () => {
    if (!file) {
      toast.error('Selecione uma foto ou vídeo');
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload do arquivo
      const { uploadFile } = await import('@/lib/upload');
      const mediaUrl = await uploadFile(file, `story-${Date.now()}.${file.type.split('/')[1]}`);
      
      // Criar story
      await createStory.mutateAsync({
        mediaUrl,
        mediaType: file.type.startsWith('video/') ? 'video' : 'image',
        caption: caption || undefined,
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa estar logado para postar stories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold">Postar Story</h1>
        </div>
      </header>
      
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Na Boka do Povo 🎬</CardTitle>
              <CardDescription>
                Compartilhe fotos ou vídeos curtos do seu trabalho. Stories ficam visíveis por 24 horas.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div>
                <Label>Foto ou Vídeo</Label>
                <div className="mt-2">
                  {!file ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Clique para fazer upload</span> ou arraste
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Foto (JPG, PNG, WEBP) ou Vídeo (MP4, WEBM, máx 20s)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tamanho máximo: 50MB
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <div className="w-full h-64 bg-black rounded-lg overflow-hidden flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <video
                            src={preview}
                            controls
                            className="max-w-full max-h-full"
                          />
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        {file.type.startsWith('image/') ? (
                          <>
                            <ImageIcon className="w-3 h-3" />
                            Imagem
                          </>
                        ) : (
                          <>
                            <Video className="w-3 h-3" />
                            Vídeo
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Caption */}
              <div>
                <Label htmlFor="caption">Legenda (opcional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Escreva uma legenda para seu story..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {caption.length}/200 caracteres
                </p>
              </div>
              
              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>💡 Dica:</strong> Stories são uma ótima forma de mostrar seu trabalho em tempo real! 
                  Compartilhe transformações, bastidores, dicas rápidas ou novidades.
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="flex-1"
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!file || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Publicar Story
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

