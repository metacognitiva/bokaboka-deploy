import { useAuth } from "@/_core/hooks/useAuth";
import { RateButton } from "@/components/RateButton";
import { ReportButton } from "@/components/ReportButton";
import { FollowButton } from "@/components/FollowButton";
import { FollowerCount } from "@/components/FollowerCount";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useRoute, Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Share2,
  Instagram,
  MessageCircle,
  Star,
  CheckCircle,
  Award,
  MapPin,
  Mail,
  Phone,
  Edit,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfessionalProfile() {
  const [, params] = useRoute("/professional/:uid");
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const { data: professional, isLoading } = trpc.professionals.getByUid.useQuery(
    { uid: params?.uid || "" },
    { enabled: !!params?.uid }
  );

  const { data: reviews } = trpc.reviews.getByProfessional.useQuery(
    { professionalId: professional?.id || 0 },
    { enabled: !!professional?.id }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Profissional não encontrado</p>
        <Button asChild>
          <Link href="/">Voltar para busca</Link>
        </Button>
      </div>
    );
  }

  const isExpired = !professional.isInActivePeriod;
  const displayStars = professional.stars / 10;
  const shareUrl = window.location.href;
  
  // Verificar se o usuário logado é o dono do perfil
  const isOwnProfile = isAuthenticated && user?.openId === professional.uid;
  
  // Debug
  console.log('DEBUG Editar Perfil:', {
    isAuthenticated,
    userOpenId: user?.openId,
    professionalUid: professional.uid,
    isOwnProfile
  });

  const handleShare = async () => {
    if (isExpired) return;

    const shareData = {
      title: `${professional.displayName} - ${professional.category}`,
      text: `Confira o perfil de ${professional.displayName} no BokaBoka!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Compartilhado com sucesso!");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copiado!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Erro ao compartilhar");
      }
    }
  };

  const handleWhatsApp = () => {
    if (isExpired) return;
    
    if (!isAuthenticated) {
      toast.error("Faça login para ver o contato");
      return;
    }

    if (professional.whatsapp) {
      const cleanPhone = professional.whatsapp.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá ${professional.displayName}, encontrei seu perfil no BokaBoka!`);
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    }
  };

  const handleInstagram = () => {
    if (isExpired) return;
    
    if (professional.instagramVideoUrl) {
      window.open(professional.instagramVideoUrl, '_blank');
    } else if (professional.instagramHandle) {
      window.open(`https://instagram.com/${professional.instagramHandle.replace('@', '')}`, '_blank');
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(displayStars);
    const hasHalfStar = displayStars % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 fill-current star-filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-5 h-5 fill-current star-filled opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 star-empty" />);
      }
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className={isExpired ? "card-expired" : ""}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Photo */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {professional.photoUrl ? (
                        <img
                          src={professional.photoUrl}
                          alt={professional.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <span className="text-4xl font-bold text-muted-foreground">
                            {professional.displayName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-start gap-2 flex-wrap">
                          <h1 className="text-3xl font-bold">{professional.displayName}</h1>
                          {professional.badge !== "none" && (
                            <Badge
                              variant="outline"
                              className={`
                                flex items-center gap-1
                                ${professional.badge === "verified" ? "badge-verified" : "badge-trusted"}
                              `}
                            >
                              {professional.badge === "verified" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Award className="w-3 h-3" />
                              )}
                              {professional.badge === "verified" ? "Verificado" : "Confiável"}
                            </Badge>
                          )}
                          {professional.planType === "destaque" && (
                            <Badge className="bg-secondary text-secondary-foreground">
                              ⭐ Destaque
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg text-muted-foreground">{professional.category}</p>
                        
                        {/* Follow Button and Follower Count */}
                        <div className="flex items-center gap-3 mt-2">
                          <FollowButton professionalId={professional.id} />
                          <FollowerCount professionalId={professional.id} />
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {renderStars()}
                        </div>
                        <span className="text-lg font-semibold">{displayStars.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({professional.reviewCount} avaliações)
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{professional.city}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Bio */}
                  {professional.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">Sobre</h3>
                      <p className="text-muted-foreground">{professional.bio}</p>
                    </div>
                  )}

                  {/* Viral Actions */}
                  <div className="flex flex-wrap gap-3">
                    {/* Botões do próprio profissional */}
                    {isOwnProfile && (
                      <>
                        <Button
                          onClick={() => setLocation('/edit-profile')}
                          variant="default"
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar Perfil
                        </Button>
                        <Button
                          onClick={() => setLocation('/upload-story')}
                          variant="default"
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Postar Story
                        </Button>
                      </>
                    )}
                    
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="sm"
                      disabled={isExpired}
                      className="viral-button"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>

                    {/* Report button */}
                    <ReportButton 
                      professionalId={professional.id}
                      professionalName={professional.displayName}
                    />

                    {/* Show rate button for authenticated users */}
                    {isAuthenticated && (
                      <RateButton 
                        professionalUid={professional.uid}
                        professionalName={professional.displayName}
                      />
                    )}

                    {(professional.instagramVideoUrl || professional.instagramHandle) && (
                      <Button
                        variant="outline"
                        onClick={handleInstagram}
                        disabled={isExpired}
                        className="viral-button"
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        Ver Instagram
                      </Button>
                    )}

                    {professional.whatsapp && (
                      <Button
                        className="viral-button bg-[#25D366] hover:bg-[#20BD5A] text-white"
                        onClick={handleWhatsApp}
                        disabled={isExpired}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {isAuthenticated ? "Chamar no WhatsApp" : "Login para ver contato"}
                      </Button>
                    )}
                  </div>

                  {isExpired && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm text-destructive font-semibold">
                        Este profissional está com o plano expirado. Os botões virais estão desabilitados.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reviews */}
              {reviews && reviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Avaliações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-current star-filled" : "star-empty"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {professional.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {isAuthenticated ? professional.phone : "Faça login para ver"}
                      </span>
                    </div>
                  )}
                  {professional.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {isAuthenticated ? professional.email : "Faça login para ver"}
                      </span>
                    </div>
                  )}
                  {!isAuthenticated && (
                    <Button asChild className="w-full mt-4">
                      <a href={getLoginUrl()}>Entrar para ver contatos</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

