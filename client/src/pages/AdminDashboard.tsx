import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { 
  ArrowLeft, CheckCircle, XCircle, Clock, Users, Briefcase, Star, 
  DollarSign, TrendingUp, Activity, Award, MapPin, BarChart3,
  Eye, MessageSquare, Shield, AlertCircle, AlertTriangle, Trash2, Pencil
} from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState, useEffect } from "react";
import EditProfessionalDialog from "@/components/EditProfessionalDialog";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [editingProfessional, setEditingProfessional] = useState<any | null>(null);

  const { data: pendingProfessionals, refetch: refetchPending } = trpc.professionals.getPending.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const { data: allProfessionals } = trpc.professionals.search.useQuery({ limit: 10000 }, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const { data: allClients } = trpc.clients.getAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const { data: allPayments } = trpc.payments.getAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const { data: allStories, refetch: refetchStories } = trpc.stories.getAllAdmin.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const deleteStory = trpc.stories.delete.useMutation({
    onSuccess: () => {
      toast.success("Story deletado com sucesso!");
      refetchStories();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const { data: bubbleConfig } = trpc.adminSettings.getBubbleConfig.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const [bubbleForm, setBubbleForm] = useState({
    message: '',
    number: 0,
    label: ''
  });

  useEffect(() => {
    if (bubbleConfig) {
      setBubbleForm(bubbleConfig);
    }
  }, [bubbleConfig]);

  const saveBubbleConfig = trpc.adminSettings.saveBubbleConfig.useMutation({
    onSuccess: () => {
      toast.success("Configurações do balão salvas com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  // Helper para verificar se profissional pagou ou usou cupom
  const getPlanStatus = (professionalId: number) => {
    const hasPaid = allPayments?.some(payment => 
      payment.professionalId === professionalId && payment.paymentStatus === 'completed'
    );
    return hasPaid ? 'Pagante' : 'Gratuito';
  };

  const approveProfessional = trpc.professionals.approve.useMutation({
    onSuccess: () => {
      toast.success("Profissional aprovado!");
      refetchPending();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const rejectProfessional = trpc.professionals.reject.useMutation({
    onSuccess: () => {
      toast.success("Profissional rejeitado.");
      refetchPending();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const deleteProfessional = trpc.professionals.delete.useMutation({
    onSuccess: () => {
      toast.success("Profissional excluído permanentemente.");
      refetchPending();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  // Calcular métricas
  const metrics = useMemo(() => {
    if (!allProfessionals) return null;

    const totalProfessionals = allProfessionals.length;
    const activeProfessionals = allProfessionals.filter(p => p.verificationStatus === 'approved').length;
    const totalReviews = allProfessionals.reduce((sum, p) => sum + p.reviewCount, 0);
    const avgRating = allProfessionals.reduce((sum, p) => sum + (p.stars / 10), 0) / totalProfessionals;
    
    // Financeiro - contar apenas profissionais com pagamento confirmado
    const basePlanPrice = 29.90;
    const premiumPlanPrice = 49.90;
    
    // IDs dos profissionais que pagaram (têm registro em payments com status completed)
    const paidProfessionalIds = new Set(
      (allPayments || []).filter(p => p.paymentStatus === 'completed').map(p => p.professionalId)
    );
    
    const paidProfessionals = allProfessionals.filter(p => paidProfessionalIds.has(p.id));
    const premiumProfessionals = paidProfessionals.filter(p => p.planType === 'destaque').length;
    const baseProfessionals = paidProfessionals.length - premiumProfessionals;
    const monthlyRevenue = (baseProfessionals * basePlanPrice) + (premiumProfessionals * premiumPlanPrice);
    const yearlyRevenue = monthlyRevenue * 12;

    // Por cidade
    const byCity = allProfessionals.reduce((acc, p) => {
      acc[p.city] = (acc[p.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCities = Object.entries(byCity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Por categoria
    const byCategory = allProfessionals.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      totalProfessionals,
      activeProfessionals,
      pendingProfessionals: pendingProfessionals?.length || 0,
      totalClients: allClients?.length || 0,
      totalReviews,
      avgRating,
      monthlyRevenue,
      yearlyRevenue,
      premiumProfessionals,
      baseProfessionals,
      topCities,
      topCategories
    };
  }, [allProfessionals, allClients, allPayments]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              Acesso Negado
            </CardTitle>
            <CardDescription>Apenas administradores podem acessar esta página</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={APP_LOGO} alt={APP_TITLE} className="w-10 h-10" />
                <div>
                  <h1 className="text-xl font-bold">Dashboard Admin</h1>
                  <p className="text-sm text-muted-foreground">Painel de Controle BokaBoka</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setLocation("/analytics")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" onClick={() => setLocation("/financial")}>
                <DollarSign className="w-4 h-4 mr-2" />
                Financeiro
              </Button>
              <Button variant="outline" onClick={() => setLocation("/moderacao")}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Moderação
              </Button>
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3" />
                Administrador
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="professionals">
              <Briefcase className="w-4 h-4 mr-2" />
              Profissionais
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="w-4 h-4 mr-2" />
              Pendentes
              {metrics && metrics.pendingProfessionals > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {metrics.pendingProfessionals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="stories">
              <MessageSquare className="w-4 h-4 mr-2" />
              Stories
              {allStories && allStories.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {allStories.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Shield className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">Total de Profissionais</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{metrics?.totalProfessionals || 0}</div>
                  <p className="text-sm text-blue-700 mt-1 font-medium">
                    {metrics?.activeProfessionals || 0} ativos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-900">Avaliações</CardTitle>
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-900">{metrics?.totalReviews || 0}</div>
                  <p className="text-sm text-yellow-700 mt-1 font-medium">
                    Média: {metrics?.avgRating.toFixed(1) || 0} ⭐
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-green-900">Receita Mensal</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">
                    R$ {metrics?.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </div>
                  <p className="text-sm text-green-700 mt-1 font-medium">
                    Anual: R$ {metrics?.yearlyRevenue.toLocaleString('pt-BR') || '0'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900">Clientes</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">{metrics?.totalClients || 0}</div>
                  <p className="text-sm text-purple-700 mt-1 font-medium">
                    Usuários cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-orange-900">Pendentes</CardTitle>
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{metrics?.pendingProfessionals || 0}</div>
                  <p className="text-sm text-orange-700 mt-1 font-medium">
                    Aguardando aprovação
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de distribuição */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Top 10 Cidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics?.topCities.map(([city, count], index) => (
                      <div key={city} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm">{city}</span>
                        </div>
                        <Badge>{count} profissionais</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Top 10 Categorias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics?.topCategories.map(([category, count], index) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm">{category}</span>
                        </div>
                        <Badge>{count} profissionais</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financeiro */}

          {/* Profissionais */}
          <TabsContent value="professionals" className="space-y-6">
            <div className="grid gap-4">
              {allProfessionals?.slice(0, 20).map((professional) => (
                <Card key={professional.id} className="bg-gradient-to-r from-white to-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="flex items-center gap-4 p-4">
                    {professional.photoUrl ? (
                      <img
                        src={professional.photoUrl}
                        alt={professional.displayName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-muted-foreground">
                          {professional.displayName.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{professional.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{professional.category}</p>
                      <p className="text-xs text-muted-foreground">{professional.city}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={professional.planType === 'destaque' ? 'default' : 'secondary'}>
                        {professional.planType === 'destaque' ? 'Destaque' : 'Base'} ({getPlanStatus(professional.id)})
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {(professional.stars / 10).toFixed(1)}
                      </Badge>
                      <Badge variant="outline">
                        {professional.reviewCount} avaliações
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProfessional(professional)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir ${professional.displayName}?`)) {
                            deleteProfessional.mutate({ id: professional.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="clients" className="space-y-6">
            {allClients && allClients.length > 0 ? (
              <div className="grid gap-4">
                {allClients.map((client) => (
                  <Card key={client.id} className="bg-gradient-to-r from-white to-purple-50 border-purple-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{client.name || 'Cliente'}</h3>
                        <p className="text-sm text-muted-foreground">{client.email || 'Sem email'}</p>
                        <p className="text-xs text-muted-foreground">Cadastrado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {client.loginMethod || 'Email'}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Abrir modal de edição de cliente
                            toast.info("Modal de edição em desenvolvimento");
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja excluir ${client.name || 'este cliente'}?`)) {
                              // TODO: Criar mutation de delete client
                              toast.error("Função de excluir cliente em desenvolvimento");
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum cliente cadastrado ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pendentes */}
          <TabsContent value="pending" className="space-y-6">
            {pendingProfessionals && pendingProfessionals.length > 0 ? (
              <div className="grid gap-4">
                {pendingProfessionals.map((professional) => (
                  <Card key={professional.id} className="bg-gradient-to-r from-white to-orange-50 border-orange-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          {professional.photoUrl ? (
                            <img
                              src={professional.photoUrl}
                              alt={professional.displayName}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                              <span className="text-2xl font-bold text-muted-foreground">
                                {professional.displayName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <CardTitle>{professional.displayName}</CardTitle>
                            <CardDescription>{professional.category} • {professional.city}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Pendente
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Descrição:</p>
                          <p className="text-sm">{professional.bio || 'Sem descrição'}</p>
                        </div>
                        
                        {professional.phone && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Telefone:</p>
                            <p className="text-sm font-mono">{professional.phone}</p>
                          </div>
                        )}

                        {/* Documentos de Verificação */}
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Verificação de Identidade
                          </h4>
                          
                          {(professional.documentPhotoUrl || professional.selfiePhotoUrl) ? (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              {professional.documentPhotoUrl ? (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">Documento</p>
                                  <img 
                                    src={professional.documentPhotoUrl} 
                                    alt="Documento" 
                                    className="w-full h-48 object-cover rounded border"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-48 bg-muted rounded border border-dashed">
                                  <p className="text-xs text-muted-foreground">Documento não enviado</p>
                                </div>
                              )}
                              {professional.selfiePhotoUrl ? (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">Selfie</p>
                                  <img 
                                    src={professional.selfiePhotoUrl} 
                                    alt="Selfie" 
                                    className="w-full h-48 object-cover rounded border"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-48 bg-muted rounded border border-dashed">
                                  <p className="text-xs text-muted-foreground">Selfie não enviada</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-32 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-900">
                              <div className="text-center">
                                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold">Fotos de verificação não enviadas</p>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">O profissional não completou o processo de verificação</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Recomendação da IA */}
                          {professional.aiVerificationResult && (() => {
                              const aiVerification = JSON.parse(professional.aiVerificationResult);
                              return (
                              <div className={`p-3 rounded-lg ${
                                aiVerification.recommendation === 'approve' 
                                  ? 'bg-green-50 border border-green-200' 
                                  : aiVerification.recommendation === 'reject'
                                  ? 'bg-red-50 border border-red-200'
                                  : 'bg-yellow-50 border border-yellow-200'
                              }`}>
                                <div className="flex items-start gap-2 mb-2">
                                  <AlertCircle className={`w-4 h-4 mt-0.5 ${
                                    aiVerification.recommendation === 'approve' 
                                      ? 'text-green-600' 
                                      : aiVerification.recommendation === 'reject'
                                      ? 'text-red-600'
                                      : 'text-yellow-600'
                                  }`} />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold">
                                      Recomendação da IA: {
                                        aiVerification.recommendation === 'approve' 
                                          ? '✅ Aprovar' 
                                          : aiVerification.recommendation === 'reject'
                                          ? '❌ Rejeitar'
                                          : '⚠️ Revisão Manual'
                                      }
                                    </p>
                                    <p className="text-xs mt-1">{aiVerification.reasoning}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                  <div>
                                    <span className="text-muted-foreground">Similaridade Facial:</span>
                                    <span className="font-semibold ml-1">{aiVerification.faceMatchScore}%</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Confiança:</span>
                                    <span className="font-semibold ml-1">{aiVerification.confidenceScore}%</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Antecedentes:</span>
                                    <span className={`font-semibold ml-1 ${
                                      aiVerification.backgroundCheckPassed ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {aiVerification.backgroundCheckPassed ? '✓ Aprovado' : '✗ Reprovado'}
                                    </span>
                                    <p className="text-xs mt-1">{aiVerification.backgroundCheckNotes}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => approveProfessional.mutate({ id: professional.id })}
                              disabled={approveProfessional.isPending}
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => rejectProfessional.mutate({ id: professional.id })}
                              disabled={rejectProfessional.isPending}
                              className="flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rejeitar
                            </Button>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja excluir permanentemente ${professional.displayName}? Esta ação não pode ser desfeita.`)) {
                                deleteProfessional.mutate({ id: professional.id });
                              }
                            }}
                            disabled={deleteProfessional.isPending}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Permanentemente
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum profissional pendente</h3>
                  <p className="text-sm text-muted-foreground">
                    Todos os profissionais foram revisados!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stories */}
          <TabsContent value="stories" className="space-y-6">
            {allStories && allStories.length > 0 ? (
              <div className="grid gap-4">
                {allStories.map((story: any) => {
                  const isExpired = new Date(story.expiresAt) < new Date();
                  return (
                    <Card key={story.id} className="bg-gradient-to-r from-white to-pink-50 border-pink-200 hover:shadow-lg transition-all duration-300">
                      <CardContent className="flex items-center gap-4 p-4">
                        {/* Thumbnail do Story */}
                        <div className="relative">
                          {story.mediaType === 'image' ? (
                            <img
                              src={story.mediaUrl}
                              alt="Story"
                              className="w-24 h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <video
                              src={story.mediaUrl}
                              className="w-24 h-32 object-cover rounded-lg"
                            />
                          )}
                          {isExpired && (
                            <Badge variant="destructive" className="absolute top-1 right-1 text-xs">
                              Expirado
                            </Badge>
                          )}
                        </div>
                        
                        {/* Informações do Profissional */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {story.professionalPhoto ? (
                              <img
                                src={story.professionalPhoto}
                                alt={story.professionalName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                                <span className="text-lg font-bold text-muted-foreground">
                                  {story.professionalName?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold">{story.professionalName || 'Profissional'}</h3>
                              <p className="text-xs text-muted-foreground">{story.professionalCategory}</p>
                            </div>
                          </div>
                          
                          {story.caption && (
                            <p className="text-sm text-muted-foreground mb-2">"{story.caption}"</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {story.viewCount} visualizações
                            </div>
                            <div>
                              Criado: {new Date(story.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                            <div>
                              Expira: {new Date(story.expiresAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2">
                          <Badge variant={story.mediaType === 'image' ? 'default' : 'secondary'}>
                            {story.mediaType === 'image' ? 'Imagem' : 'Vídeo'}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja deletar este story de ${story.professionalName}?`)) {
                                deleteStory.mutate({ id: story.id });
                              }
                            }}
                            disabled={deleteStory.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum story encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Quando profissionais criarem stories, eles aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Shield className="w-6 h-6" />
                  Editor do Balão de Estatísticas
                </CardTitle>
                <CardDescription className="text-indigo-700">
                  Edite a mensagem e os números que aparecem no balão laranja da página inicial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bubbleMessage" className="text-indigo-900 font-semibold">Mensagem do Balão</Label>
                  <Textarea
                    id="bubbleMessage"
                    placeholder="Ex: Novos profissionais cadastrados hoje!"
                    rows={3}
                    className="mt-2"
                    value={bubbleForm.message}
                    onChange={(e) => setBubbleForm({ ...bubbleForm, message: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bubbleNumber" className="text-indigo-900 font-semibold">Número Principal</Label>
                    <Input
                      id="bubbleNumber"
                      type="number"
                      placeholder="Ex: 150"
                      className="mt-2"
                      value={bubbleForm.number}
                      onChange={(e) => setBubbleForm({ ...bubbleForm, number: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bubbleLabel" className="text-indigo-900 font-semibold">Label do Número</Label>
                    <Input
                      id="bubbleLabel"
                      placeholder="Ex: profissionais"
                      className="mt-2"
                      value={bubbleForm.label}
                      onChange={(e) => setBubbleForm({ ...bubbleForm, label: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => saveBubbleConfig.mutate(bubbleForm)}
                  disabled={saveBubbleConfig.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {saveBubbleConfig.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertTriangle className="w-6 h-6" />
                  Moderação de Stories
                </CardTitle>
                <CardDescription className="text-red-700">
                  Sistema de IA detecta automaticamente conteúdos impróprios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Moderação com IA</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Sistema em desenvolvimento. Em breve você poderá revisar stories automaticamente.
                  </p>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    Em Desenvolvimento
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

      <EditProfessionalDialog
        professional={editingProfessional}
        open={!!editingProfessional}
        onOpenChange={(open) => !open && setEditingProfessional(null)}
        onSuccess={() => {
          // Refetch all professionals data
          window.location.reload();
        }}
      />
    </>  
  );
}

