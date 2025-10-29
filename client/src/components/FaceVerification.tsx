import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle, XCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface FaceVerificationProps {
  onVerified: (faceImageBlob: Blob, faceImageUrl: string) => void;
  title?: string;
  description?: string;
  withDocument?: boolean;
}

export function FaceVerification({ 
  onVerified, 
  title = "Verificação Facial",
  description = "Tire uma foto do seu rosto para verificação de identidade",
  withDocument = false
}: FaceVerificationProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      console.log("[FaceVerification] Tentando acessar câmera...");
      console.log("[FaceVerification] navigator.mediaDevices:", navigator.mediaDevices);
      console.log("[FaceVerification] getUserMedia:", navigator.mediaDevices?.getUserMedia);
      
      // Verificar se navigator.mediaDevices está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = "Seu navegador não suporta acesso à câmera. Use Chrome, Firefox ou Safari.";
        console.error("[FaceVerification]", errorMsg);
        setCameraError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log("[FaceVerification] Solicitando permissão da câmera...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log("[FaceVerification] Câmera acessada com sucesso!", stream);
      console.log("[FaceVerification] Tracks:", stream.getTracks());
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
        setCameraError(null);
        toast.success("Câmera ativada! Posicione seu rosto no centro.");
      }
    } catch (error: any) {
      console.error("[FaceVerification] Error accessing camera:", error);
      console.error("[FaceVerification] Error name:", error.name);
      console.error("[FaceVerification] Error message:", error.message);
      
      let errorMsg = '';
      if (error.name === 'NotAllowedError') {
        errorMsg = "Permissão negada. Permita o acesso à câmera ou use o upload de arquivo.";
      } else if (error.name === 'NotFoundError') {
        errorMsg = "Nenhuma câmera encontrada. Use o upload de arquivo.";
      } else if (error.name === 'NotReadableError') {
        errorMsg = "Câmera em uso. Feche outros apps ou use o upload de arquivo.";
      } else {
        errorMsg = `Erro ao acessar câmera: ${error.message || 'Erro desconhecido'}. Use o upload de arquivo.`;
      }
      
      setCameraError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCapturedImage(url);
            setImageBlob(blob);
            stopCamera();
            toast.success("Foto capturada com sucesso!");
          }
        }, "image/jpeg", 0.95);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setImageBlob(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (imageBlob && capturedImage) {
      onVerified(imageBlob, capturedImage);
      toast.success("Verificação facial concluída!");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setCapturedImage(url);
    setImageBlob(file);
    toast.success('Foto carregada com sucesso!');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
          {withDocument && (
            <span className="block mt-2 text-amber-600 font-semibold">
              ⚠️ Segure seu documento ao lado do rosto
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCapturing && !capturedImage && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-64 h-64 rounded-full bg-muted flex items-center justify-center">
              <Camera className="w-24 h-24 text-muted-foreground" />
            </div>
            
            {cameraError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-red-800">{cameraError}</p>
              </div>
            )}
            
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button onClick={startCamera} size="lg" className="w-full">
                <Camera className="w-5 h-5 mr-2" />
                Iniciar Câmera
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>
              
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                size="lg" 
                variant="outline"
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Enviar Foto da Galeria
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {isCapturing && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 border-4 border-primary rounded-lg opacity-50" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={stopCamera}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={capturePhoto}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capturar Foto
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <img
                src={capturedImage}
                alt="Foto capturada"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Tirar Novamente
              </Button>
              <Button
                onClick={confirmPhoto}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Foto
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="text-xs text-muted-foreground text-center pt-4 border-t space-y-1">
          <p>💡 <strong>Dicas para uma boa foto:</strong></p>
          <p>• Ambiente bem iluminado</p>
          <p>• Rosto centralizado e visível</p>
          <p>• Sem óculos escuros ou chapéus</p>
          {withDocument && <p>• Documento legível ao lado do rosto</p>}
        </div>
      </CardContent>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </Card>
  );
}

