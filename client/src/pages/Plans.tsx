import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
import { useLocation } from "wouter";
import { 
  ArrowLeft, Check, AlertCircle, CreditCard, Zap, Star, TrendingUp,
  Shield, Clock, Sparkles
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export default function Plans() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleSelectPlan = (planType: 'base' | 'destaque') => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para assinar um plano");
      setLocation("/login");
      return;
    }

    // Redirecionar para checkout com ID do profissional
    // Por enquanto, usar ID 1 (profissional de teste)
    // Em produção, pegar o ID do profissional logado
    const professionalId = 1;
    toast.success(`Redirecionando para pagamento...`);
    setLocation(`/checkout/${professionalId}/${planType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={APP_LOGO} alt="BokaBoka" className="h-10 w-10" />
                <div>
                  <h1 className="text-xl font-bold">Planos BokaBoka</h1>
                  <p className="text-sm text-muted-foreground">Escolha o melhor plano para você</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-12">
        {/* Aviso sobre Trial */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">5 Dias de Trial Grátis</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Todos os novos profissionais têm 5 dias grátis para testar a plataforma. Após esse período, é necessário assinar um dos planos abaixo.
          </AlertDescription>
        </Alert>

        {/* Aviso sobre Cobrança Recorrente */}
        <Alert className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">⚠️ Cobrança Recorrente Mensal</AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            <strong>ATENÇÃO:</strong> Ao assinar qualquer plano, você autoriza a cobrança <strong>automática mensal</strong> no seu cartão de crédito. 
            O valor será cobrado todo mês na mesma data da contratação. Você pode cancelar a qualquer momento sem multa.
          </AlertDescription>
        </Alert>

        {/* Cards de Planos */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Plano Base */}
          <Card className="relative border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Plano Base</Badge>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">R$ 29,90</div>
                  <div className="text-sm text-muted-foreground">por mês</div>
                </div>
              </div>
              <CardTitle className="text-2xl">Base</CardTitle>
              <CardDescription>
                Ideal para profissionais que estão começando na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Perfil completo com fotos e vídeo do Instagram</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Aparece nas buscas por categoria e cidade</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Botão de WhatsApp visível para clientes</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Sistema de avaliações verificadas</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Compartilhamento em redes sociais</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Badge de verificação</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Suporte por email</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <CreditCard className="w-4 h-4" />
                  <span>Cobrança automática mensal</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleSelectPlan('base')}
                >
                  Assinar Plano Base
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plano Destaque */}
          <Card className="relative border-2 border-primary shadow-lg hover:shadow-xl transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Mais Popular
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="default">Plano Destaque</Badge>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">R$ 49,90</div>
                  <div className="text-sm text-muted-foreground">por mês</div>
                </div>
              </div>
              <CardTitle className="text-2xl">Destaque</CardTitle>
              <CardDescription>
                Para profissionais que querem se destacar e receber mais clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold">Tudo do Plano Base +</span>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>Prioridade nas buscas</strong> - Aparece no topo dos resultados</span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>Badge "Destaque"</strong> - Selo especial no perfil</span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>Estatísticas avançadas</strong> - Veja quem visitou seu perfil</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>Badge "Confiável"</strong> - Aumenta credibilidade</span>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>Destaque visual</strong> - Card diferenciado com borda dourada</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Suporte prioritário via WhatsApp</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <CreditCard className="w-4 h-4" />
                  <span>Cobrança automática mensal</span>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="lg"
                  onClick={() => handleSelectPlan('destaque')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Assinar Plano Destaque
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ sobre Pagamentos */}
        <Card className="mt-12 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Perguntas Frequentes sobre Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Como funciona a cobrança recorrente?</h4>
              <p className="text-sm text-muted-foreground">
                Ao assinar qualquer plano, você autoriza a cobrança automática mensal no seu cartão de crédito. 
                O valor será cobrado todo mês na mesma data da contratação inicial.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem multa. O cancelamento terá efeito no final do período já pago.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">O que acontece após o trial de 5 dias?</h4>
              <p className="text-sm text-muted-foreground">
                Após os 5 dias de trial grátis, seu perfil ficará com 70% de opacidade e os botões virais (WhatsApp, compartilhar) 
                serão desabilitados até que você assine um dos planos.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Posso mudar de plano depois?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade do Plano Base para o Plano Destaque a qualquer momento. 
                O valor será ajustado proporcionalmente.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Quais formas de pagamento são aceitas?</h4>
              <p className="text-sm text-muted-foreground">
                Aceitamos cartões de crédito (Visa, Mastercard, Elo, American Express) e PIX para pagamento único mensal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Garantia */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-900">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Pagamento 100% seguro e criptografado
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

