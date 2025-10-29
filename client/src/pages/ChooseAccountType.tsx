import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { Briefcase, User, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ChooseAccountType() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const setUserTypeMutation = trpc.auth.setUserType.useMutation();

  const handleChooseType = async (type: "client" | "professional") => {
    console.log("[ChooseAccountType] User clicked:", type);
    setIsRedirecting(true);
    try {
      console.log("[ChooseAccountType] Calling setUserType mutation...");
      await setUserTypeMutation.mutateAsync({ userType: type });
      console.log("[ChooseAccountType] Mutation successful!");
      
      const redirectPath = type === "professional" ? "/cadastrar-profissional" : "/cadastrar-cliente";
      console.log("[ChooseAccountType] Redirecting to:", redirectPath);
      
      // Use window.location.href for maximum iOS Safari compatibility
      // Wait a bit to ensure mutation is committed
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 300);
    } catch (error) {
      console.error("[ChooseAccountType] Failed to set user type:", error);
      setIsRedirecting(false);
    }
  };

  useEffect(() => {
    console.log("[ChooseAccountType] Auth state:", { isAuthenticated, loading });
    if (!loading && !isAuthenticated) {
      console.log("[ChooseAccountType] Not authenticated, redirecting to /");
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isRedirecting ? "Redirecionando..." : "Carregando..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Bem-vindo ao BokaBoka!</h2>
          <p className="text-lg text-muted-foreground mb-2">
            Como você deseja usar a plataforma?
          </p>
          <p className="text-sm text-muted-foreground">
            👇 Clique em um dos cartões abaixo para continuar seu cadastro
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Professional Card */}
          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-green-500 hover:bg-green-50/50"
                onClick={() => handleChooseType("professional")}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Sou Profissional</CardTitle>
              <CardDescription className="text-base">
                Quero oferecer meus serviços
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Cadastro completo com verificação de documentos</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Galeria de fotos dos seus trabalhos</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Integração com Instagram e WhatsApp</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>5 dias de trial gratuito</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Selo de verificação após aprovação</span>
              </div>
              <Button className="w-full mt-4" size="lg">
                Cadastrar como Profissional
              </Button>
            </CardContent>
          </Card>

          {/* Client Card */}
          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-orange-500 hover:bg-orange-50/50"
                onClick={() => handleChooseType("client")}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Sou Cliente</CardTitle>
              <CardDescription className="text-base">
                Quero contratar profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Cadastro rápido com verificação facial</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Acesso a contatos de profissionais verificados</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Visualize avaliações e comentários</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>Busca por categoria e cidade</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>100% gratuito para clientes</span>
              </div>
              <Button className="w-full mt-4" size="lg" variant="outline">
                Cadastrar como Cliente
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            Voltar para a página inicial
          </Button>
        </div>
      </div>
    </div>
  );
}

