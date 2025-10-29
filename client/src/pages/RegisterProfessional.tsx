import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AudioRecorder } from "@/components/AudioRecorder";
import { FaceVerification } from "@/components/FaceVerification";
import { DocumentUpload } from "@/components/DocumentUpload";
import { WorkPhotosUpload } from "@/components/WorkPhotosUpload";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function RegisterProfessional() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 8; // Etapa 1: Login + 7 etapas de cadastro
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Buscar categorias do banco de dados
  const { data: categories, isLoading: loadingCategories } = trpc.categories.list.useQuery();

  // Mostrar modal de aviso se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginWarning(true);
    }
  }, [isAuthenticated]);

  // Se já autenticado, pular etapa 1 (login)
  useEffect(() => {
    if (isAuthenticated && step === 1) {
      console.log('[RegisterProfessional] User already authenticated, skipping to step 2');
      setStep(2);
    }
  }, [isAuthenticated, step]);

  // Form data
  const [formData, setFormData] = useState({
    displayName: "",
    category: "",
    city: "",
    state: "",
    phone: "",
    whatsapp: "",
    email: "",
    bio: "",
    cpf: "",
    rg: "",
    address: "",
    cep: "",
  });

  // Files
  const [useAudio, setUseAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [workPhotos, setWorkPhotos] = useState<File[]>([]);
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [instagramHandle, setInstagramHandle] = useState("");
  const [instagramVideoUrl, setInstagramVideoUrl] = useState("");

  const createProfessional = trpc.professionals.create.useMutation({
    onSuccess: () => {
      setShowSuccessModal(true);
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    },
  });

  const handleSubmit = async () => {
    try {
      toast.info("Fazendo upload das fotos...");
      
      const { uploadFile } = await import("@/lib/upload");
      
      // Upload das fotos de verificação
      let documentPhotoUrl: string | undefined;
      let selfiePhotoUrl: string | undefined;
      
      if (documentBlob) {
        documentPhotoUrl = await uploadFile(documentBlob, `document-${Date.now()}.jpg`);
      }
      
      if (selfieBlob) {
        selfiePhotoUrl = await uploadFile(selfieBlob, `selfie-${Date.now()}.jpg`);
      }
      
      // Upload das fotos de trabalho
      const workPhotoUrls: string[] = [];
      if (workPhotos.length > 0) {
        toast.info(`Enviando ${workPhotos.length} fotos de trabalhos...`);
        for (let i = 0; i < workPhotos.length; i++) {
          const url = await uploadFile(workPhotos[i], `work-${Date.now()}-${i}.jpg`);
          workPhotoUrls.push(url);
        }
      }
      
      toast.info("Enviando cadastro para análise...");
      
      createProfessional.mutate({
        ...formData,
        city: `${formData.city} - ${formData.state}`,
        photoUrl: workPhotoUrls.length > 0 ? workPhotoUrls[0] : undefined, // Usar primeira foto de trabalho como foto principal (NUNCA selfie com documento)
        instagramHandle: instagramHandle || undefined,
        instagramVideoUrl: instagramVideoUrl || undefined,
        documentPhotoUrl,
        selfiePhotoUrl,
        workPhotos: workPhotoUrls.length > 0 ? JSON.stringify(workPhotoUrls) : undefined,
      });
    } catch (error) {
      toast.error("Erro ao fazer upload das fotos");
      console.error(error);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step === 2) {
      // Se estiver na primeira etapa do cadastro, voltar para página principal
      setLocation("/");
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.displayName && formData.category && formData.city && formData.state;
      case 3:
        return formData.phone && formData.whatsapp && formData.email;
      case 4:
        return formData.cpf && formData.rg && formData.address && formData.cep;
      case 5:
        return (useAudio && audioBlob) || (!useAudio && formData.bio);
      case 6:
        return workPhotos.length >= 3; // Mínimo 3 fotos
      case 7:
        return documentBlob !== null;
      case 8:
        return selfieBlob !== null;
      default:
        return true;
    }
  };

  if (!isAuthenticated) {
    // Salvar URL atual para voltar após login
    const handleLogin = () => {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      console.log('[RegisterProfessional] Saving redirect URL:', window.location.pathname);
      window.location.href = getLoginUrl();
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Login Necessário</CardTitle>
            <CardDescription>
              Você precisa estar logado para se cadastrar como profissional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full">
              Fazer Login para Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
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
          <div className="text-sm text-muted-foreground">
            Etapa {step} de {totalSteps}
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container py-4">
        <Progress value={(step / totalSteps) * 100} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Cadastro de Profissional</h2>
            <p className="text-muted-foreground mt-2">
              Preencha todos os dados para verificação e aprovação
            </p>
          </div>

          {/* Aviso sobre Trial e Planos */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                ℹ️
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  5 Dias de Trial Grátis + Planos a partir de R$ 29,90/mês
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  Após a aprovação do seu cadastro, você terá <strong>5 dias grátis</strong> para testar a plataforma. 
                  Depois desse período, é necessário assinar um dos planos:
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 mb-3">
                  <li>• <strong>Plano Base:</strong> R$ 29,90/mês (cobrança recorrente)</li>
                  <li>• <strong>Plano Destaque:</strong> R$ 49,90/mês (cobrança recorrente + prioridade nas buscas)</li>
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('/planos', '_blank')}
                  className="bg-white dark:bg-background"
                >
                  Ver Detalhes dos Planos
                </Button>
              </div>
            </div>
          </div>

          {/* Step 1: Login/Autenticação */}
          {step === 1 && !isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo ao BokaBoka!</CardTitle>
                <CardDescription>
                  Para começar seu cadastro como profissional, faça login primeiro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Você será redirecionado para fazer login de forma segura.
                  Após o login, voltará automaticamente para continuar seu cadastro.
                </p>
                <Button 
                  onClick={() => {
                    localStorage.setItem('redirectAfterLogin', '/cadastrar-profissional');
                    window.location.href = getLoginUrl();
                  }}
                  className="w-full"
                  size="lg"
                >
                  Fazer Login para Continuar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/")}
                  className="w-full"
                >
                  Voltar para Início
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Dados Básicos (antiga etapa 1) */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Dados Básicos</CardTitle>
                <CardDescription>Informações principais do profissional</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome Completo *</Label>
                  <Input
                    id="displayName"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Profissão *</Label>
                  {loadingCategories ? (
                    <Input disabled placeholder="Carregando profissões..." />
                  ) : (
                    <select
                      id="category"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione uma profissão</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      required
                      placeholder="Ex: São Paulo"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      required
                      placeholder="Ex: SP"
                      maxLength={2}
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Contato */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Dados de Contato</CardTitle>
                <CardDescription>Como os clientes vão entrar em contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    required
                    placeholder="(11) 98765-4321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    required
                    placeholder="(11) 98765-4321"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramHandle">Instagram (opcional)</Label>
                  <Input
                    id="instagramHandle"
                    placeholder="@seuperfil"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramVideoUrl">Link do Vídeo Instagram (opcional)</Label>
                  <Input
                    id="instagramVideoUrl"
                    placeholder="https://www.instagram.com/reel/..."
                    value={instagramVideoUrl}
                    onChange={(e) => setInstagramVideoUrl(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Documentos Pessoais */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Documentos Pessoais</CardTitle>
                <CardDescription>Informações para verificação de identidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    required
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg">RG *</Label>
                  <Input
                    id="rg"
                    required
                    placeholder="00.000.000-0"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Input
                    id="address"
                    required
                    placeholder="Rua, número, bairro"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    required
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Sobre Você */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Sobre Você e Seus Serviços</CardTitle>
                <CardDescription>
                  Escolha como deseja apresentar seus serviços
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!useAudio ? "default" : "outline"}
                    onClick={() => setUseAudio(false)}
                    className="flex-1"
                  >
                    ✍️ Escrever Texto
                  </Button>
                  <Button
                    type="button"
                    variant={useAudio ? "default" : "outline"}
                    onClick={() => setUseAudio(true)}
                    className="flex-1"
                  >
                    🎤 Gravar Áudio
                  </Button>
                </div>

                {!useAudio ? (
                  <div className="space-y-2">
                    <Label htmlFor="bio">Descrição dos seus serviços *</Label>
                    <Textarea
                      id="bio"
                      required
                      rows={8}
                      placeholder="Conte sobre sua experiência, serviços oferecidos, diferenciais, certificações..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>
                ) : (
                  <AudioRecorder 
                    onAudioReady={(blob) => setAudioBlob(blob)} 
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Fotos dos Trabalhos */}
          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Galeria de Trabalhos</CardTitle>
                <CardDescription>
                  Mostre seus melhores trabalhos realizados (mínimo 3 fotos)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkPhotosUpload
                  photos={workPhotos}
                  onPhotosChange={setWorkPhotos}
                  maxPhotos={10}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 6: Upload de Documento */}
          {step === 7 && (
            <DocumentUpload
              onUploaded={(blob, url) => setDocumentBlob(blob)}
              title="Upload do Documento"
              description="Envie uma foto clara do seu RG ou CNH"
            />
          )}

          {/* Step 7: Verificação Facial */}
          {step === 8 && (
            <FaceVerification
              onVerified={(blob, url) => setSelfieBlob(blob)}
              title="Selfie com Documento"
              description="Tire uma selfie segurando seu documento ao lado do rosto"
              withDocument={true}
            />
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || createProfessional.isPending}
                className="flex-1"
              >
                {createProfessional.isPending ? "Enviando..." : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enviar Cadastro
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Modal de Sucesso: Cadastro em Análise */}
      <Dialog open={showSuccessModal} onOpenChange={(open) => {
        setShowSuccessModal(open);
        if (!open) setLocation('/');
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Seu cadastro está em análise 😉
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-4 space-y-3">
              <p>
                Em breve você vai receber a confirmação pra começar a divulgar seus serviços no BOKABOKA.
              </p>
              <p className="font-semibold text-primary">
                Fique de olho — pode ser o início de muitas novas oportunidades! 🚀
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                setLocation('/');
              }}
              className="w-full"
            >
              Entendi!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Aviso: Login Necessário */}
      <Dialog open={showLoginWarning} onOpenChange={setShowLoginWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">🔑 Login Necessário</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Antes de cadastrar, você precisa fazer login com seu e-mail.
              <br /><br />
              <strong>Como fazer:</strong>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Clique no botão <strong>"Entrar"</strong> no topo da página</li>
                <li>Faça login com seu e-mail</li>
                <li>Volte para esta página e complete seu cadastro</li>
              </ol>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLoginWarning(false)}
              className="w-full sm:w-auto"
            >
              Entendi
            </Button>
            <Button
              onClick={() => {
                // Redirecionar para login e voltar para cadastro após login
                window.location.href = `${getLoginUrl()}?redirect=/cadastrar-profissional`;
              }}
              className="w-full sm:w-auto"
            >
              Fazer Login Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

