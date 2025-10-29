import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface ReportButtonProps {
  professionalId: number;
  professionalName: string;
}

export function ReportButton({ professionalId, professionalName }: ReportButtonProps) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const createReport = trpc.reports.create.useMutation({
    onSuccess: () => {
      toast.success("Denúncia enviada com sucesso!");
      setOpen(false);
      setCategory("");
      setDescription("");
      setIsAnonymous(false);
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !description.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    createReport.mutate({
      reportedProfessionalId: professionalId,
      category: category as any,
      description: description.trim(),
      anonymous: isAnonymous
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <AlertTriangle className="w-4 h-4" />
          Denunciar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Denunciar Profissional
          </DialogTitle>
          <DialogDescription>
            Denuncie {professionalName} se identificou comportamento inadequado ou ilícito.
            Sua denúncia será analisada por nossa equipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Motivo da Denúncia *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fraud">Fraude / Golpe</SelectItem>
                <SelectItem value="inappropriate_behavior">Comportamento Inadequado</SelectItem>
                <SelectItem value="service_not_delivered">Serviço Não Prestado</SelectItem>
                <SelectItem value="fake_profile">Perfil Falso</SelectItem>
                <SelectItem value="harassment">Assédio</SelectItem>
                <SelectItem value="illegal_activity">Atividade Ilegal</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que aconteceu com o máximo de detalhes possível..."
              className="min-h-[120px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              Quanto mais detalhes você fornecer, mais rápido poderemos analisar sua denúncia.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
              Fazer denúncia anônima
            </Label>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              ⚠️ <strong>Atenção:</strong> Denúncias falsas podem resultar em suspensão da sua conta.
              Use este recurso com responsabilidade.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createReport.isPending || !category || !description.trim()}
              className="flex-1"
            >
              {createReport.isPending ? "Enviando..." : "Enviar Denúncia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

