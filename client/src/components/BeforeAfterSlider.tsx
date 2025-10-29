import { useState } from 'react';
import ReactCompareImage from 'react-compare-image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, X } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  professionalName: string;
  open: boolean;
  onClose: () => void;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  professionalName,
  open,
  onClose,
}: BeforeAfterSliderProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareData = {
        title: `Transformação por ${professionalName}`,
        text: `Veja esta incrível transformação feita por ${professionalName}! 🔥`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Compartilhado com sucesso!');
      } else {
        // Fallback: copiar link
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Erro ao compartilhar');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              ✨ Antes e Depois
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Arraste o controle para comparar • Transformação por <strong>{professionalName}</strong>
          </p>
        </DialogHeader>

        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <ReactCompareImage
            leftImage={beforeImage}
            rightImage={afterImage}
            sliderLineWidth={4}
            sliderLineColor="#10b981"
            handleSize={50}
            hover={true}
            leftImageLabel="Antes"
            rightImageLabel="Depois"
            leftImageCss={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
            rightImageCss={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isSharing ? 'Compartilhando...' : 'Compartilhar Transformação'}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Fechar
          </Button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-2">
          <p className="text-sm text-emerald-800 text-center">
            💡 <strong>Dica:</strong> Arraste o controle deslizante para ver a transformação completa!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

