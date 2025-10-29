import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Share2, Instagram, MessageCircle, Star, CheckCircle, Award, Image as ImageIcon, Edit } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { PhotoGalleryDialog } from "./PhotoGalleryDialog";
import { ReviewsDialog } from "./ReviewsDialog";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { trpc } from "@/lib/trpc";

interface ProfessionalCardProps {
  professional: {
    id: number;
    uid: string;
    displayName: string;
    category: string;
    city: string;
    phone?: string | null;
    whatsapp?: string | null;
    bio?: string | null;
    photoUrl?: string | null;
    galleryPhotos?: string | null;
    beforeAfterPhotos?: string | null; // JSON: { before: url, after: url }
    instagramVideoUrl?: string | null;
    instagramHandle?: string | null;
    stars: number;
    reviewCount: number;
    badge: "none" | "verified" | "trusted";
    planType: "base" | "destaque";
    isInActivePeriod: boolean;
    responseTime?: number | null; // Tempo médio de resposta em minutos
    distance?: number | null; // Distância em km
  };
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const { isAuthenticated, user } = useAuth();
  const isOwnProfile = user?.openId === professional.uid;
  const [, setLocation] = useLocation();
  const [isSharing, setIsSharing] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [beforeAfterOpen, setBeforeAfterOpen] = useState(false);
  
  // Fetch reviews for dialog and card back
  const { data: reviews } = trpc.reviews.getByProfessional.useQuery(
    { professionalId: professional.id },
    { enabled: reviewsOpen || isFlipped }
  );
  
  // Get top 2 reviews for card back
  const topReviews = reviews?.slice(0, 2) || [];
  
  // Check if card should be in expired state
  const isExpired = !professional.isInActivePeriod;
  
  // Check if this is the logged user's own card
  const isOwnCard = user?.openId === professional.uid;
  
  // Convert stars from integer (0-50) to display (0-5)
  const displayStars = professional.stars / 10;
  
  // Parse gallery photos
  const galleryPhotos = professional.galleryPhotos 
    ? JSON.parse(professional.galleryPhotos) 
    : [];
  
  // Parse before/after photos
  const beforeAfterPhotos = professional.beforeAfterPhotos
    ? JSON.parse(professional.beforeAfterPhotos)
    : null;
  
  // Get safe photo URL (never use document verification photos)
  const getSafePhotoUrl = () => {
    // If no photoUrl, use first gallery photo or null
    if (!professional.photoUrl) {
      return galleryPhotos.length > 0 ? galleryPhotos[0] : null;
    }
    
    // Check if photoUrl contains common document verification patterns
    const isDocumentPhoto = professional.photoUrl.includes('document') || 
                           professional.photoUrl.includes('selfie') ||
                           professional.photoUrl.includes('verification');
    
    // If it's a document photo, use first gallery photo instead
    if (isDocumentPhoto && galleryPhotos.length > 0) {
      return galleryPhotos[0];
    }
    
    return professional.photoUrl;
  };
  
  const safePhotoUrl = getSafePhotoUrl();
  
  // Generate shareable URL for this specific professional
  const shareUrl = `${window.location.origin}/professional/${professional.uid}`;
  
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExpired) return;
    
    setIsSharing(true);
    
    const shareData = {
      title: `${professional.displayName} - ${professional.category}`,
      text: `Confira o perfil de ${professional.displayName} no BokaBoka! ${professional.bio?.substring(0, 100) || ''}`,
      url: shareUrl,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Compartilhado com sucesso!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Erro ao compartilhar");
      }
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleInstagram = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExpired) return;
    
    if (professional.instagramVideoUrl) {
      window.open(professional.instagramVideoUrl, '_blank');
    } else if (professional.instagramHandle) {
      window.open(`https://instagram.com/${professional.instagramHandle.replace('@', '')}`, '_blank');
    }
  };
  
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExpired) return;
    
    if (!isAuthenticated) {
      toast.error("Faça login para ver o contato do profissional");
      return;
    }
    
    if (professional.whatsapp) {
      const cleanPhone = professional.whatsapp.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá ${professional.displayName}, encontrei seu perfil no BokaBoka!`);
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    } else {
      toast.error("WhatsApp não disponível");
    }
  };

  const handleGalleryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryOpen(true);
  };

  const handleReviewsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReviewsOpen(true);
  };
  
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(displayStars);
    const hasHalfStar = displayStars % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-current star-filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-current star-filled opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 star-empty" />);
      }
    }
    
    return stars;
  };
  
  const getBadgeIcon = () => {
    if (professional.badge === "verified") return <CheckCircle className="w-3 h-3" />;
    if (professional.badge === "trusted") return <Award className="w-3 h-3" />;
    return null;
  };
  
  const getBadgeLabel = () => {
    if (professional.badge === "verified") return "Verificado";
    if (professional.badge === "trusted") return "Confiável";
    return null;
  };

  return (
    <>
      {/* Card Container */}
      <div className="relative">
        {/* FRENTE DO CARD */}
        <Card 
          className={`
            overflow-hidden
            ${professional.planType === "destaque" ? "border-primary border-2" : ""}
            ${isExpired ? "card-expired" : "card-hover"}
          `}
          style={{ display: isFlipped ? 'none' : 'block' }}
        >
        {/* Professional Photo - Clickable */}
        <Link href={`/professional/${professional.uid}`}>
          <div className="relative h-56 bg-muted overflow-hidden cursor-pointer">
            {safePhotoUrl ? (
              <img 
                src={safePhotoUrl} 
                alt={`${professional.displayName} - ${professional.category} em ${professional.city}`}
                loading="lazy"
                className="w-full h-full object-cover"
                style={{ 
                  objectPosition: professional.displayName.includes('Maria Eduarda') 
                    ? 'center 35%'  // Maria Eduarda: foco no rosto sem cortar cabeça
                    : 'center 40%'  // Outros: mostra cabeça completa + rosto centralizado
                }}
                // Centraliza o rosto em mobile e desktop
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <span className="text-6xl font-bold text-muted-foreground">
                  {professional.displayName.charAt(0)}
                </span>
              </div>
            )}
            
                      {/* Botão Ver Transformação - Antes/Depois (APENAS PLANO DESTAQUE) */}
            {beforeAfterPhotos && beforeAfterPhotos.before && beforeAfterPhotos.after && professional.planType === 'destaque' && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg animate-pulse"
                onClick={(e) => {
                  e.stopPropagation();
                  setBeforeAfterOpen(true);
                }}
                disabled={isExpired}
              >
                ✨ Ver Transformação
              </Button>
            )}
            
            {/* Gallery Button */}
            {galleryPhotos.length > 0 && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-2 right-2 viral-button"
                onClick={handleGalleryClick}
                disabled={isExpired}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                {galleryPhotos.length}
              </Button>
            )}
            
            {/* Botão Editar (apenas para o próprio profissional) */}
            {isOwnProfile && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white font-bold shadow-2xl z-10 animate-pulse border-2 border-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLocation('/edit-profile');
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
            
            {/* Plan Badge */}
            {professional.planType === "destaque" && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-secondary text-secondary-foreground font-semibold">
                  ⭐ Destaque
                </Badge>
              </div>
            )}
            
            {/* Expired Overlay */}
            {isExpired && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Badge variant="destructive" className="text-sm font-semibold">
                  Plano Expirado
                </Badge>
              </div>
            )}
          </div>
        </Link>
        
        {/* Header - Clickable */}
        <Link href={`/professional/${professional.uid}`}>
          <CardHeader className="pb-3 cursor-pointer">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{professional.displayName}</h3>
              
              {/* Badges embaixo do nome - CHAMATIVOS */}
              <div className="flex items-center gap-2 mt-1 mb-2 flex-wrap">
                {/* Badge Verificado */}
                {professional.badge === "verified" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 cursor-help">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verificado
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">📍 Profissional com documento e selfie verificados pela equipe BokaBoka</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Badge Confiável */}
                {professional.badge === "trusted" && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Confiável
                  </span>
                )}
                
                {/* Badge Responde Rápido */}
                {professional.responseTime && professional.responseTime <= 60 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 cursor-help animate-pulse">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Responde Rápido
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">⚡ Profissional responde mensagens em menos de 1 hora</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Badge Destaque */}
                {professional.planType === "destaque" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-300 cursor-help">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Destaque
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">⭐ Profissional com plano Destaque - aparece primeiro nas buscas e tem mais visibilidade</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">{professional.category}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-muted-foreground">{professional.city}</p>
                {professional.distance !== undefined && professional.distance !== null && (
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {professional.distance < 1 
                      ? `${Math.round(professional.distance * 1000)} m`
                      : `${professional.distance.toFixed(1)} km`
                    }
                  </span>
                )}
              </div>
            </div>
            
            {/* Rating - Clickable to see reviews */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center gap-2 mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleReviewsClick}
                  >
                    <div className="flex items-center gap-0.5">
                      {renderStars()}
                    </div>
                    <span className="text-sm font-semibold">{displayStars.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({professional.reviewCount})</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">🔒 Sistema de avaliações verificadas com foto do serviço realizado e reconhecimento facial - Clique para ver detalhes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
        </Link>
        
        {/* Bio */}
        {professional.bio && (
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {professional.bio}
            </p>
          </CardContent>
        )}
        
        {/* Viral Actions */}
        <CardFooter className="flex flex-col gap-2 pt-3 border-t">
              {/* Linha 1: Compartilhar e Instagram */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 viral-button"
              onClick={handleShare}
              disabled={isSharing || isExpired}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isSharing ? "Compartilhando..." : "Compartilhar"}
            </Button>
            
            {/* Instagram Button */}
            {(professional.instagramVideoUrl || professional.instagramHandle) && (
              <Button
                variant="outline"
                size="sm"
                className="viral-button border-pink-500 text-pink-500 hover:bg-pink-50"
                onClick={handleInstagram}
                disabled={isExpired}
              >
                <Instagram className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {/* Linha 2: WhatsApp */}
          {professional.whatsapp && (
            <Button
              size="sm"
              className="w-full viral-button bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm"
              onClick={handleWhatsApp}
              disabled={isExpired}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>{isAuthenticated ? "WhatsApp" : "Login"}</span>
            </Button>
          )}
          
          {/* Linha 3: Posso confiar? */}
          <Button
            variant="outline"
            size="sm"
            className="w-full viral-button border-blue-500 text-blue-500 hover:bg-blue-50 text-sm font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
            disabled={isExpired}
          >
            <span>Posso confiar? 😬</span>
          </Button>
        </CardFooter>
        </Card>
        
        {/* VERSO DO CARD */}
        <Card 
          className={`
            overflow-hidden
            ${professional.planType === "destaque" ? "border-primary border-2" : ""}
          `}
          style={{ display: isFlipped ? 'block' : 'none' }}
        >
        <div className="p-6 flex flex-col h-full">
            <div className="pb-4">
              <h2 className="text-xl font-bold">Mais sobre {professional.displayName}</h2>
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Melhores Avaliações
                </h3>
                
                {topReviews.length > 0 ? (
                  <div className="space-y-3">
                    {topReviews.map((review) => (
                      <div key={review.id} className="space-y-1">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating / 10
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.comment || "Esse é um ser humano fora de série. Faz de tudo para ajudar o..."}
                        </p>
                        <p className="text-xs text-muted-foreground">-</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Esse é um ser humano fora de série. Faz de tudo para ajudar o...
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 pt-4 border-t mt-auto">
              <p className="text-sm text-center text-muted-foreground">
                É profissional? Quer contratar?
              </p>
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white font-bold text-lg py-6"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  localStorage.setItem('redirectAfterLogin', window.location.pathname);
                  window.location.href = '/escolher-tipo';
                }}
              >
                CADASTRE-SE
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
              >
                Voltar
              </Button>
            </div>
        </div>
        </Card>
      </div>

      {/* Photo Gallery Dialog */}
      <PhotoGalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        photos={galleryPhotos}
        professionalName={professional.displayName}
      />

      {/* Reviews Dialog */}
      <ReviewsDialog
        open={reviewsOpen}
        onOpenChange={setReviewsOpen}
        reviews={reviews || []}
        professionalName={professional.displayName}
      />
      
      {/* Before/After Slider */}
      {beforeAfterPhotos && beforeAfterPhotos.before && beforeAfterPhotos.after && (
        <BeforeAfterSlider
          open={beforeAfterOpen}
          onClose={() => setBeforeAfterOpen(false)}
          beforeImage={beforeAfterPhotos.before}
          afterImage={beforeAfterPhotos.after}
          professionalName={professional.displayName}
        />
      )}
    </>
  );
}

