import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ArrowLeft, Star, Upload, X, Loader2, Camera } from 'lucide-react';
import { getLoginUrl } from '@/const';

export default function RateProfessional() {
  const [, params] = useRoute('/avaliar/:uid');
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const { data: professional, isLoading } = trpc.professionals.getByUid.useQuery(
    { uid: params?.uid || '' },
    { enabled: !!params?.uid }
  );
  
  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success('Avaliação enviada com sucesso! Obrigado! 🌟');
      setLocation(`/professional/${params?.uid}`);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }
    
    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande! Máximo 10MB');
      return;
    }
    
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  
  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhoto(null);
    setPhotoPreview('');
  };
  
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para avaliar');
      return;
    }
    
    if (rating === 0) {
      toast.error('Selecione uma nota de 1 a 5 estrelas');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Escreva um comentário sobre o serviço');
      return;
    }
    
    if (!professional) {
      toast.error('Profissional não encontrado');
      return;
    }
    
    setSubmitting(true);
    
    try {
      let photoUrl: string | undefined;
      
      // Upload da foto (se houver)
      if (photo) {
        const { uploadFile } = await import('@/lib/upload');
        photoUrl = await uploadFile(photo, `review-${Date.now()}.jpg`);
      }
      
      // Criar avaliação
      await createReview.mutateAsync({
        professionalId: professional.id,
        rating,
        comment: comment.trim(),
        servicePhotoUrl: photoUrl,
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-lg text-muted-foreground">Profissional não encontrado</p>
        <Button onClick={() => setLocation('/')}>
          Voltar para Home
        </Button>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Login Necessário</CardTitle>
            <CardDescription>
              Você precisa estar logado para avaliar profissionais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
            <Button variant="outline" onClick={() => setLocation('/')} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation(`/professional/${params?.uid}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold">Avaliar Profissional</h1>
        </div>
      </header>
      
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                {professional.photoUrl && (
                  <img
                    src={professional.photoUrl}
                    alt={professional.displayName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <CardTitle>{professional.displayName}</CardTitle>
                  <CardDescription>{professional.category}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Rating Stars */}
              <div>
                <Label className="text-base">Como você avalia o serviço? *</Label>
                <div className="flex items-center gap-2 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-lg font-semibold">
                      {rating === 1 && '😞 Ruim'}
                      {rating === 2 && '😐 Regular'}
                      {rating === 3 && '🙂 Bom'}
                      {rating === 4 && '😊 Muito Bom'}
                      {rating === 5 && '🤩 Excelente'}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Comment */}
              <div>
                <Label htmlFor="comment" className="text-base">
                  Conte como foi sua experiência *
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Descreva o serviço realizado, qualidade, pontualidade, atendimento, custo-benefício..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  className="mt-2"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/1000 caracteres
                </p>
              </div>
              
              {/* Photo Upload */}
              <div>
                <Label className="text-base">
                  Adicione uma foto do serviço (opcional)
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  ⭐ Avaliações com foto valem 2x mais no ranking!
                </p>
                
                {!photo ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-10 h-10 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Clique para fazer upload</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG ou WEBP (máx. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemovePhoto}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>💡 Sua avaliação é importante!</strong> Ajude outros clientes a escolherem 
                  o melhor profissional. Seja honesto e detalhado.
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/professional/${params?.uid}`)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={rating === 0 || !comment.trim() || submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Enviar Avaliação
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

