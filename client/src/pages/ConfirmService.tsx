import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Camera, Star, Upload, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { FaceVerification } from "@/components/FaceVerification";

export default function ConfirmService() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");
  const professionalUid = params.get("professional");

  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [servicePhoto, setServicePhoto] = useState<File | null>(null);
  const [servicePhotoPreview, setServicePhotoPreview] = useState<string>("");
  const [verificationPhoto, setVerificationPhoto] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const servicePhotoRef = useRef<HTMLInputElement>(null);

  const { data: professional } = trpc.professionals.getByUid.useQuery(
    { uid: professionalUid || "" },
    { enabled: !!professionalUid }
  );

  const createReviewMutation = trpc.reviews.create.useMutation();

  const handleServicePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setServicePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setServicePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerificationComplete = (photoDataUrl: string) => {
    setVerificationPhoto(photoDataUrl);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!user || !professional) return;

    setIsSubmitting(true);
    try {
      // In a real app, upload photos to S3 first
      await createReviewMutation.mutateAsync({
        professionalId: professional.id,
        rating,
        comment,
        servicePhotoUrl: servicePhotoPreview,
        verificationPhotoUrl: verificationPhoto,
        confirmationToken: token || undefined,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Login Necessário</CardTitle>
            <CardDescription>
              Você precisa estar cadastrado para confirmar um serviço
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Para garantir a autenticidade das avaliações, é necessário ter uma conta verificada.
            </p>
            <Button asChild className="w-full" size="lg">
              <a href={getLoginUrl()}>Fazer Login / Cadastrar</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle>Avaliação Enviada!</CardTitle>
            <CardDescription>
              Obrigado por confirmar o serviço realizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Sua avaliação verificada foi publicada no perfil de <strong>{professional.displayName}</strong>.
            </p>
            <Button onClick={() => setLocation(`/professional/${professional.uid}`)} className="w-full">
              Ver Perfil do Profissional
            </Button>
            <Button onClick={() => setLocation("/")} variant="outline" className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Serviço Realizado</CardTitle>
            <CardDescription>
              Profissional: <strong>{professional.displayName}</strong> - {professional.category}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  1
                </div>
                <span className="text-sm font-medium hidden sm:inline">Avaliação</span>
              </div>
              <div className="flex-1 h-0.5 bg-muted mx-2"></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  2
                </div>
                <span className="text-sm font-medium hidden sm:inline">Verificação</span>
              </div>
              <div className="flex-1 h-0.5 bg-muted mx-2"></div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  3
                </div>
                <span className="text-sm font-medium hidden sm:inline">Confirmar</span>
              </div>
            </div>

            {/* Step 1: Rating and Photo */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label>Avaliação do Serviço</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="comment">Comentário sobre o Serviço</Label>
                  <Textarea
                    id="comment"
                    placeholder="Descreva como foi o serviço realizado..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Foto do Serviço Realizado *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tire uma foto do resultado do serviço para comprovar a realização
                  </p>
                  <input
                    ref={servicePhotoRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleServicePhotoChange}
                    className="hidden"
                  />
                  {servicePhotoPreview ? (
                    <div className="relative">
                      <img
                        src={servicePhotoPreview}
                        alt="Foto do serviço"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => servicePhotoRef.current?.click()}
                        className="mt-2"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Tirar Outra Foto
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => servicePhotoRef.current?.click()}
                      className="w-full h-32"
                    >
                      <Camera className="w-8 h-8 mr-2" />
                      Tirar Foto do Serviço
                    </Button>
                  )}
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!servicePhoto || !comment}
                  className="w-full"
                  size="lg"
                >
                  Próximo: Verificação Facial
                </Button>
              </div>
            )}

            {/* Step 2: Face Verification */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">Verificação Facial</h3>
                  <p className="text-sm text-muted-foreground">
                    Tire uma selfie para confirmar que você realmente recebeu o serviço
                  </p>
                </div>
                <FaceVerification 
                  onVerified={(blob, url) => handleVerificationComplete(url)}
                  title="Verificação Facial"
                  description="Tire uma selfie para confirmar que você recebeu o serviço"
                />
                <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                  Voltar
                </Button>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Confirmar Avaliação</h3>
                  <p className="text-sm text-muted-foreground">
                    Revise as informações antes de enviar
                  </p>
                </div>

                <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <Label className="text-sm text-muted-foreground">Avaliação</Label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Comentário</Label>
                    <p className="text-sm mt-1">{comment}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Foto do Serviço</Label>
                    <img
                      src={servicePhotoPreview}
                      alt="Serviço realizado"
                      className="w-full h-48 object-cover rounded-lg mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Verificação Facial</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Selfie capturada com sucesso</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Editar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                    size="lg"
                  >
                    {isSubmitting ? "Enviando..." : "Confirmar e Enviar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

