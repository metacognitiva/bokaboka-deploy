import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface Review {
  id: number;
  rating: number;
  comment?: string | null;
  audioUrl?: string | null;
  emoji?: string | null;
  createdAt: Date;
}

interface ReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviews: Review[];
  professionalName: string;
}

export function ReviewsDialog({
  open,
  onOpenChange,
  reviews,
  professionalName,
}: ReviewsDialogProps) {
  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-current star-filled" : "star-empty"
        }`}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Avaliações de {professionalName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
          </p>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma avaliação ainda
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      {review.emoji && (
                        <span className="text-2xl">{review.emoji}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-foreground">{review.comment}</p>
                  )}

                  {/* Audio */}
                  {review.audioUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playAudio(review.audioUrl!)}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Ouvir avaliação em áudio
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

