import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { 
  ArrowLeft, Users, Star, DollarSign, TrendingUp,
  Briefcase, Eye, MessageCircle, Share2, Filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Analytics() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: platformStats } = trpc.analytics.getPlatformStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const { data: financialStats } = trpc.analytics.getFinancialStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const { data: conversionFunnel } = trpc.analytics.getConversionFunnel.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você precisa ser administrador para acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/admin")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={APP_LOGO} alt="BokaBoka" className="w-10 h-10" />
                <div>
                  <h1 className="text-xl font-bold">Analytics</h1>
                  <p className="text-sm text-muted-foreground">Métricas da Plataforma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Aviso Google Analytics */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Eye className="w-5 h-5" />
              Google Analytics Integrado
            </CardTitle>
            <CardDescription className="text-blue-700">
              Dados detalhados de tráfego, origem de visitantes e comportamento estão disponíveis no{" "}
              <a 
                href="https://analytics.google.com/analytics/web/#/p468147810/reports/intelligenthome"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Google Analytics (ID: G-V18V3X8EDZ)
              </a>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-green-600" />
                Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{platformStats?.totalProfessionals || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Cadastrados na plataforma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{platformStats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Usuários registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{platformStats?.totalReviews || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total de reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R$ {((financialStats?.totalRevenue || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pagamentos completados</p>
            </CardContent>
          </Card>
        </div>

        {/* Funil de Conversão */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Funil de Conversão
            </CardTitle>
            <CardDescription>
              Jornada do usuário desde a visita até a avaliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversionFunnel ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Visitantes', value: conversionFunnel.visitors, fill: '#3b82f6' },
                      { name: 'Visualizações de Perfil', value: conversionFunnel.profileViews, fill: '#10b981' },
                      { name: 'Cliques no WhatsApp', value: conversionFunnel.whatsappClicks, fill: '#f59e0b' },
                      { name: 'Avaliações', value: conversionFunnel.reviews, fill: '#8b5cf6' },
                    ]}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {[
                        { name: 'Visitantes', value: conversionFunnel.visitors, fill: '#3b82f6' },
                        { name: 'Visualizações de Perfil', value: conversionFunnel.profileViews, fill: '#10b981' },
                        { name: 'Cliques no WhatsApp', value: conversionFunnel.whatsappClicks, fill: '#f59e0b' },
                        { name: 'Avaliações', value: conversionFunnel.reviews, fill: '#8b5cf6' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Taxas de Conversão */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {conversionFunnel.visitors > 0 
                        ? ((conversionFunnel.profileViews / conversionFunnel.visitors) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Visitantes → Perfis</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {conversionFunnel.profileViews > 0 
                        ? ((conversionFunnel.whatsappClicks / conversionFunnel.profileViews) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Perfis → WhatsApp</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {conversionFunnel.whatsappClicks > 0 
                        ? ((conversionFunnel.reviews / conversionFunnel.whatsappClicks) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">WhatsApp → Avaliações</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Carregando dados do funil...</p>
            )}
          </CardContent>
        </Card>

        {/* Métricas Financeiras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Receita por Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              {financialStats?.revenueByPlan && financialStats.revenueByPlan.length > 0 ? (
                <div className="space-y-4">
                  {financialStats.revenueByPlan.map((plan) => (
                    <div key={plan.planType} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {plan.planType === 'base' ? 'Plano Base' : 'Plano Destaque'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {plan.count} assinatura{plan.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          R$ {((plan.total || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma receita registrada ainda</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Assinaturas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Plano Base</p>
                    <p className="text-sm text-muted-foreground">Assinaturas pagas</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {financialStats?.revenueByPlan?.find(p => p.planType === 'base')?.count || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Plano Destaque</p>
                    <p className="text-sm text-muted-foreground">Assinaturas pagas</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {financialStats?.revenueByPlan?.find(p => p.planType === 'destaque')?.count || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Acessar Métricas Detalhadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">📊 Tráfego e Visitantes</h3>
              <p className="text-sm text-muted-foreground">
                Acesse o Google Analytics para ver dados em tempo real de visitantes, páginas mais acessadas, 
                tempo de permanência, taxa de rejeição e origem do tráfego (orgânico, direto, redes sociais).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📱 Dispositivos e Localização</h3>
              <p className="text-sm text-muted-foreground">
                Veja quais dispositivos (mobile, desktop, tablet) e sistemas operacionais seus usuários utilizam, 
                além de dados geográficos detalhados (cidades, estados, países).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🎯 Comportamento do Usuário</h3>
              <p className="text-sm text-muted-foreground">
                Analise o fluxo de navegação, páginas de entrada e saída, eventos personalizados e conversões.
              </p>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => window.open('https://analytics.google.com/analytics/web/#/p468147810/reports/intelligenthome', '_blank')}
            >
              Abrir Google Analytics
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

