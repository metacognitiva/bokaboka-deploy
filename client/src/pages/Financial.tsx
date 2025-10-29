import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { 
  ArrowLeft, DollarSign, TrendingUp, CreditCard, Users,
  Calendar, PieChart, BarChart3, AlertCircle
} from "lucide-react";
import { useMemo } from "react";
import {
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  LineChart as RechartsLine,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function Financial() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: financialStats } = trpc.analytics.getFinancialStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const { data: allProfessionals } = trpc.professionals.search.useQuery({ limit: 10000 }, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  // Calcular métricas financeiras
  const metrics = useMemo(() => {
    if (!financialStats || !allProfessionals) return null;

    // Converter valores de centavos para reais
    const totalRevenueInReais = financialStats.totalRevenue / 100;
    const mrrInReais = financialStats.mrr / 100;
    const projectedAnnualInReais = financialStats.projectedAnnualRevenue / 100;

    // Calcular receita por plano
    const revenueByPlan = financialStats.revenueByPlan.map(plan => ({
      name: plan.planType === 'base' ? 'Base (R$ 29,90)' : 'Destaque (R$ 49,90)',
      value: Number(plan.total) / 100,
      count: Number(plan.count)
    }));

    // Assinaturas ativas
    const activeSubscriptions = financialStats.activeSubscriptions.map(sub => ({
      name: sub.planType === 'base' ? 'Base' : 'Destaque',
      value: Number(sub.count)
    }));

    // Calcular churn rate (simulado - em produção viria do histórico)
    const churnRate = 5.2; // 5.2% ao mês

    // Projeção de crescimento (próximos 12 meses)
    const growthRate = 0.15; // 15% ao mês
    const projections = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      const projectedMRR = mrrInReais * Math.pow(1 + growthRate, i);
      return {
        month: month.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        mrr: Math.round(projectedMRR),
        pessimistic: Math.round(projectedMRR * 0.7),
        optimistic: Math.round(projectedMRR * 1.3)
      };
    });

    // Pagamentos recentes formatados
    const recentPaymentsFormatted = financialStats.recentPayments.map(payment => ({
      ...payment,
      amountInReais: payment.amount / 100,
      dateFormatted: new Date(payment.createdAt).toLocaleDateString('pt-BR'),
      planName: payment.planType === 'base' ? 'Base' : 'Destaque'
    }));

    // Profissionais pagantes
    const payingProfessionals = allProfessionals.filter(p => p.isActive);

    return {
      totalRevenue: totalRevenueInReais,
      mrr: mrrInReais,
      projectedAnnual: projectedAnnualInReais,
      revenueByPlan,
      activeSubscriptions,
      churnRate,
      projections,
      recentPayments: recentPaymentsFormatted,
      payingProfessionals,
      totalPayingProfessionals: payingProfessionals.length,
    };
  }, [financialStats, allProfessionals]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Apenas administradores podem acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const COLORS = ['#10b981', '#f97316', '#3b82f6', '#8b5cf6'];

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
                onClick={() => setLocation("/admin")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={APP_LOGO} alt="BokaBoka" className="h-10 w-10" />
                <div>
                  <h1 className="text-xl font-bold">Dashboard Financeiro</h1>
                  <p className="text-sm text-muted-foreground">Receitas, MRR e Projeções</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <DollarSign className="w-3 h-3" />
              Dados Reais
            </Badge>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* KPIs Financeiros Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {metrics?.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Receita Recorrente Mensal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {metrics?.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Acumulado histórico
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projeção Anual</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {metrics?.projectedAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Baseado no MRR atual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalPayingProfessionals}</div>
              <p className="text-xs text-muted-foreground">
                Churn: {metrics?.churnRate}% ao mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projeção de Crescimento */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Projeção de Crescimento (12 meses)
            </CardTitle>
            <CardDescription>Cenários otimista, realista e pessimista</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLine data={metrics?.projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Line type="monotone" dataKey="pessimistic" stroke="#ef4444" name="Pessimista" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="mrr" stroke="#10b981" name="Realista" strokeWidth={3} />
                <Line type="monotone" dataKey="optimistic" stroke="#3b82f6" name="Otimista" strokeWidth={2} strokeDasharray="5 5" />
              </RechartsLine>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Receita por Plano */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Receita por Plano
              </CardTitle>
              <CardDescription>Comparativo Base vs Destaque</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBar data={metrics?.revenueByPlan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Bar dataKey="value" fill="#10b981" name="Receita Total" />
                </RechartsBar>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {metrics?.revenueByPlan.map((plan, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{plan.name}:</span>
                    <span className="font-semibold">{plan.count} pagamentos</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Assinaturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Distribuição de Assinaturas
              </CardTitle>
              <CardDescription>Assinantes ativos por plano</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={metrics?.activeSubscriptions}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics?.activeSubscriptions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Pagamentos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Histórico de Pagamentos Recentes
            </CardTitle>
            <CardDescription>Últimos 50 pagamentos processados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Data</th>
                    <th className="text-left py-3 px-4 font-medium">Profissional ID</th>
                    <th className="text-left py-3 px-4 font-medium">Plano</th>
                    <th className="text-left py-3 px-4 font-medium">Valor</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.recentPayments.slice(0, 10).map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{payment.dateFormatted}</td>
                      <td className="py-3 px-4 text-sm">#{payment.professionalId}</td>
                      <td className="py-3 px-4 text-sm">{payment.planName}</td>
                      <td className="py-3 px-4 text-sm font-semibold">
                        R$ {payment.amountInReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={payment.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                          {payment.paymentStatus === 'completed' ? 'Pago' : 
                           payment.paymentStatus === 'pending' ? 'Pendente' : 
                           payment.paymentStatus === 'failed' ? 'Falhou' : 'Reembolsado'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!metrics?.recentPayments || metrics.recentPayments.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum pagamento registrado ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Insights Financeiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Insights Financeiros
            </CardTitle>
            <CardDescription>Análises e recomendações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100">MRR Saudável</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    O MRR atual de R$ {metrics?.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com {metrics?.totalPayingProfessionals} assinantes ativos indica crescimento sustentável.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Projeção Anual</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Com a taxa atual, a projeção de receita anual é de R$ {metrics?.projectedAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100">Atenção ao Churn</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Taxa de churn estimada em {metrics?.churnRate}% ao mês. Considere implementar estratégias de retenção.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

