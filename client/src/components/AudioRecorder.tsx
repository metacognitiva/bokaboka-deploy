import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Play, Trash2, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, audioUrl: string) => void;
  title?: string;
  description?: string;
}

export function AudioRecorder({ 
  onAudioReady, 
  title = "Grave sua descrição em áudio",
  description = "Para profissionais que preferem falar ao invés de escrever"
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Gravação iniciada!");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Erro ao acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Gravação finalizada!");
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const deleteAudio = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    chunksRef.current = [];
    toast.info("Áudio excluído");
  };

  const uploadAudio = () => {
    if (audioBlob && audioUrl) {
      onAudioReady(audioBlob, audioUrl);
      toast.success("Áudio pronto para envio!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!audioUrl ? (
          <div className="flex flex-col items-center gap-4 py-8">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={startRecording}
                className="w-full max-w-xs"
              >
                <Mic className="w-5 h-5 mr-2" />
                Iniciar Gravação
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-red-500 animate-pulse">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="font-semibold">Gravando...</span>
                </div>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="w-full max-w-xs"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Parar Gravação
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
              <Mic className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Áudio gravado com sucesso
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={playAudio}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Ouvir
              </Button>
              <Button
                variant="outline"
                onClick={deleteAudio}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>

            <Button
              onClick={uploadAudio}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Usar este áudio
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          💡 Dica: Fale de forma clara sobre seus serviços, experiência e diferenciais.
          O áudio ajuda clientes a conhecerem melhor seu trabalho!
        </div>
      </CardContent>
    </Card>
  );
}

