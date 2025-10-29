import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Professional {
  id: number;
  displayName: string;
  category: string;
  city: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  bio: string | null;
  photoUrl: string | null;
  instagramHandle: string | null;
  planType: "base" | "destaque";
  verificationStatus: "pending" | "approved" | "rejected";
}

interface EditProfessionalDialogProps {
  professional: Professional | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditProfessionalDialog({ professional, open, onOpenChange, onSuccess }: EditProfessionalDialogProps) {
  const [formData, setFormData] = useState({
    displayName: "",
    category: "",
    city: "",
    phone: "",
    whatsapp: "",
    email: "",
    bio: "",
    instagramHandle: "",
    planType: "base" as "base" | "destaque",
  });

  useEffect(() => {
    if (professional) {
      setFormData({
        displayName: professional.displayName,
        category: professional.category,
        city: professional.city,
        phone: professional.phone || "",
        whatsapp: professional.whatsapp || "",
        email: professional.email || "",
        bio: professional.bio || "",
        instagramHandle: professional.instagramHandle || "",
        planType: professional.planType,
      });
    }
  }, [professional]);

  const updateProfessional = trpc.professionals.update.useMutation({
    onSuccess: () => {
      toast.success("Profissional atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professional) return;

    updateProfessional.mutate({
      id: professional.id,
      ...formData,
    });
  };

  if (!professional) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Profissional</DialogTitle>
          <DialogDescription>
            Edite as informações do profissional {professional.displayName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome Completo *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Psicólogo, Encanador..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: Natal - RN"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planType">Plano *</Label>
              <Select value={formData.planType} onValueChange={(value: "base" | "destaque") => setFormData({ ...formData, planType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base (R$ 29,90/mês)</SelectItem>
                  <SelectItem value="destaque">Destaque (R$ 49,90/mês)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(84) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="(84) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramHandle">Instagram</Label>
              <Input
                id="instagramHandle"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                placeholder="@usuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Conte sobre sua experiência e serviços..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProfessional.isPending}>
              {updateProfessional.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

