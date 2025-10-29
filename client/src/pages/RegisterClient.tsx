import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaceVerification } from "@/components/FaceVerification";
import { APP_TITLE } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function RegisterClient() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [faceBlob, setFaceBlob] = useState<Blob | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
  });

  const handleSubmit = async () => {
    if (!faceBlob) {
      toast.error("Verificação facial obrigatória");
      return;
    }

    // TODO: Save client verification data
    toast.success("Cadastro concluído! Agora você pode contratar profissionais.");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold gradient-text">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Cadastro de Cliente</h2>
            <p className="text-muted-foreground mt-2">
              Cadastro rápido com verificação facial para sua segurança
            </p>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Dados Básicos</CardTitle>
                <CardDescription>Informações para contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    required
                    placeholder="(11) 98765-4321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.phone}
                  className="w-full"
                >
                  Próximo
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <>
              <FaceVerification
                onVerified={(blob) => setFaceBlob(blob)}
                title="Verificação Facial"
                description="Tire uma selfie para verificação de identidade e segurança"
              />

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!faceBlob}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Concluir Cadastro
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

