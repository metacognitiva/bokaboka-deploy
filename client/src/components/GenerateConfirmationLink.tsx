import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GenerateConfirmationLinkProps {
  professionalUid: string;
  professionalName: string;
}

export function GenerateConfirmationLink({ professionalUid, professionalName }: GenerateConfirmationLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate unique token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Build confirmation link
  const confirmationUrl = `${window.location.origin}/confirmar-servico?professional=${professionalUid}&token=${token}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(confirmationUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleShare = async () => {
    const message = `Olá! Finalizei o serviço para você. Por favor, confirme e avalie através deste link:\n\n${confirmationUrl}\n\nObrigado! - ${professionalName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Confirmar Serviço - BokaBoka",
          text: message,
        });
      } catch (error) {
        // User cancelled or error occurred
        handleCopy();
      }
    } else {
      // Fallback to WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="w-4 h-4 mr-2" />
          Gerar Link de Confirmação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link de Confirmação de Serviço</DialogTitle>
          <DialogDescription>
            Envie este link para o cliente confirmar e avaliar o serviço realizado
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link">Link de Confirmação</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                value={confirmationUrl}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Como funciona:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Cliente precisa estar cadastrado</li>
              <li>✓ Tira foto do serviço realizado</li>
              <li>✓ Faz verificação facial (selfie)</li>
              <li>✓ Avalia com estrelas e comentário</li>
              <li>✓ Avaliação verificada aparece no seu perfil</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleShare} className="flex-1">
              Enviar via WhatsApp
            </Button>
            <Button onClick={handleCopy} variant="outline" className="flex-1">
              Copiar Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

