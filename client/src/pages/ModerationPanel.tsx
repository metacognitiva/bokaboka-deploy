import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { AlertTriangle, CheckCircle, XCircle, Shield, Ban, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function ModerationPanel() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedAction, setSelectedAction] = useState<Record<number, string>>({});
  const [resolutions, setResolutions] = useState<Record<number, string>>({});

  const { data: reports, refetch } = trpc.reports.getAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  const resolveReport = trpc.reports.resolve.useMutation({
    onSuccess: () => {
      toast.success("Denúncia resolvida!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const rejectReport = trpc.reports.reject.useMutation({
    onSuccess: () => {
      toast.success("Denúncia rejeitada.");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

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
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      fraud: "Fraude / Golpe",
      inappropriate_behavior: "Comportamento Inadequado",
      service_not_delivered: "Serviço Não Prestado",
      fake_profile: "Perfil Falso",
      harassment: "Assédio",
      illegal_activity: "Atividade Ilegal",
      other: "Outro"
    };
    return labels[category] || category;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      warning: "Advertência",
      suspend_7_days: "Suspensão 7 dias",
      suspend_15_days: "Suspensão 15 dias",
      suspend_30_days: "Suspensão 30 dias",
      ban_permanent: "Banimento Permanente",
      delete_account: "Excluir Conta"
    };
    return labels[action] || action;
  };

  const pendingReports = reports?.filter(r => r.status === "pending") || [];
  const resolvedReports = reports?.filter(r => r.status === "resolved") || [];
  const rejectedReports = reports?.filter(r => r.status === "rejected") || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              Painel de Moderação
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie denúncias e tome ações disciplinares
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/admin")}>
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReports.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedReports.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedReports.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Denúncias Pendentes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Denúncias Pendentes</h2>
          
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma denúncia pendente</h3>
                <p className="text-sm text-muted-foreground">
                  Todas as denúncias foram revisadas!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingReports.map((report) => (
                <Card key={report.id} className="border-orange-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          Denúncia #{report.id}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Profissional: <strong>{report.professionalName}</strong>
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Pendente
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="destructive">{getCategoryLabel(report.category)}</Badge>
                      <p className="text-sm mt-3">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Denunciado em: {new Date(report.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Ação Disciplinar</label>
                        <Select
                          value={selectedAction[report.id] || ""}
                          onValueChange={(value) => setSelectedAction({ ...selectedAction, [report.id]: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma ação" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="warning">⚠️ Advertência</SelectItem>
                            <SelectItem value="suspend_7_days">🚫 Suspensão 7 dias</SelectItem>
                            <SelectItem value="suspend_15_days">🚫 Suspensão 15 dias</SelectItem>
                            <SelectItem value="suspend_30_days">🚫 Suspensão 30 dias</SelectItem>
                            <SelectItem value="ban_permanent">⛔ Banimento Permanente</SelectItem>
                            <SelectItem value="delete_account">🗑️ Excluir Conta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Resolução / Justificativa</label>
                        <Textarea
                          value={resolutions[report.id] || ""}
                          onChange={(e) => setResolutions({ ...resolutions, [report.id]: e.target.value })}
                          placeholder="Descreva a resolução e justificativa da ação..."
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (!resolutions[report.id]?.trim()) {
                              toast.error("Preencha a resolução");
                              return;
                            }
                            resolveReport.mutate({
                              reportId: report.id,
                              resolution: resolutions[report.id],
                              action: selectedAction[report.id] as any,
                            });
                          }}
                          disabled={resolveReport.isPending || !resolutions[report.id]?.trim()}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolver e Aplicar Ação
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (!resolutions[report.id]?.trim()) {
                              toast.error("Preencha o motivo da rejeição");
                              return;
                            }
                            rejectReport.mutate({
                              reportId: report.id,
                              reason: resolutions[report.id],
                            });
                          }}
                          disabled={rejectReport.isPending || !resolutions[report.id]?.trim()}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeitar Denúncia
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Histórico */}
        {(resolvedReports.length > 0 || rejectedReports.length > 0) && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold">Histórico de Denúncias</h2>
            
            <div className="grid gap-4">
              {[...resolvedReports, ...rejectedReports].slice(0, 10).map((report) => (
                <Card key={report.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">Denúncia #{report.id}</CardTitle>
                        <CardDescription>
                          Profissional: {report.professionalName}
                        </CardDescription>
                      </div>
                      <Badge variant={report.status === "resolved" ? "default" : "secondary"}>
                        {report.status === "resolved" ? "Resolvida" : "Rejeitada"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p><strong>Categoria:</strong> {getCategoryLabel(report.category)}</p>
                      <p className="text-muted-foreground">{report.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

