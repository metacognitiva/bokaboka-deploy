import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Upload, X } from "lucide-react";

interface Professional {
  id?: number;
  displayName: string;
  category: string;
  city: string;
  state?: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  bio: string | null;
  photoUrl: string | null;
  instagramHandle: string | null;
  planType: "base" | "destaque";
  verificationStatus: "pending" | "approved" | "rejected";
  isNew?: boolean;
}

interface EditProfessionalDialogProps {
  professional: Professional | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditProfessionalDialog({ professional, open, onOpenChange, onSuccess }: EditProfessionalDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    category: "",
    city: "",
    state: "",
    phone: "",
    whatsapp: "",
    email: "",
    bio: "",
    instagramHandle: "",
    planType: "base" as "base" | "destaque",
    verificationStatus: "approved" as "pending" | "approved" | "rejected",
  });

  useEffect(() => {
    if (professional && !professional.isNew) {
      setFormData({
        displayName: professional.displayName,
        category: professional.category,
        city: professional.city,
        state: professional.state || "",
        phone: professional.phone || "",
        whatsapp: professional.whatsapp || "",
        email: professional.email || "",
        bio: professional.bio || "",
        instagramHandle: professional.instagramHandle || "",
        planType: professional.planType,
        verificationStatus: professional.verificationStatus,
      });
      setPhotoPreview(professional.photoUrl);
    } else if (professional?.isNew) {
      // Reset form for new professional
      setFormData({
        displayName: "",
        category: "",
        city: "",
        state: "",
        phone: "",
        whatsapp: "",
        email: "",
        bio: "",
        instagramHandle: "",
        planType: "base",
        verificationStatus: "approved",
      });
      setPhotoPreview(null);
      setPhotoFile(null);
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

  const createProfessional = trpc.professionals.create.useMutation({
    onSuccess: () => {
      toast.success("Profissional criado com sucesso!");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande! Máximo 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let photoUrl = photoPreview;

    // Upload photo if new file selected
    if (photoFile) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', photoFile);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          throw new Error('Erro ao fazer upload da foto');
        }

        const data = await response.json();
        photoUrl = data.url;
      } catch (error) {
        toast.error('Erro ao fazer upload da foto');
        return;
      }
    }

    const professionalData = {
      ...formData,
      photoUrl,
    };

    if (professional?.isNew) {
      createProfessional.mutate(professionalData);
    } else if (professional?.id) {
      updateProfessional.mutate({
        id: professional.id,
        ...professionalData,
      });
    }
  };

  if (!professional) return null;

  const isNew = professional.isNew;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Inserir Novo Profissional" : "Editar Profissional"}</DialogTitle>
          <DialogDescription>
            {isNew ? "Preencha os dados do novo profissional" : `Edite as informações de ${professional.displayName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload de Foto */}
          <div className="space-y-2">
            <Label>Foto do Profissional</Label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {photoPreview ? "Trocar Foto" : "Upload Foto"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo 5MB - JPG, PNG
                </p>
              </div>
            </div>
          </div>

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
                placeholder="Ex: Natal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Ex: RN"
                maxLength={2}
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
              <Label htmlFor="verificationStatus">Status de Verificação *</Label>
              <Select value={formData.verificationStatus} onValueChange={(value: "pending" | "approved" | "rejected") => setFormData({ ...formData, verificationStatus: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
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
            <Button type="submit" disabled={updateProfessional.isPending || createProfessional.isPending}>
              {updateProfessional.isPending || createProfessional.isPending ? "Salvando..." : isNew ? "Criar Profissional" : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
