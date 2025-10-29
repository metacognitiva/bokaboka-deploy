import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from 'sonner';
import { Loader2, Upload, X, ArrowLeft } from 'lucide-react';
import { useAuth } from "@/_core/hooks/useAuth";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: professional, isLoading } = trpc.professionals.getMyProfile.useQuery();
  const updateProfile = trpc.professionals.updateProfile.useMutation();
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    phone: '',
    whatsapp: '',
    instagramHandle: '',
    photoUrl: '',
    beforeAfterBefore: '',
    beforeAfterAfter: '',
    galleryPhotos: [] as string[],
  });
  
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    if (professional) {
      const beforeAfter = professional.beforeAfterPhotos 
        ? JSON.parse(professional.beforeAfterPhotos)
        : { before: '', after: '' };
        
      const galleryPhotos = professional.galleryPhotos
        ? JSON.parse(professional.galleryPhotos)
        : [];
      
      setFormData({
        displayName: professional.displayName || '',
        bio: professional.bio || '',
        phone: professional.phone || '',
        whatsapp: professional.whatsapp || '',
        instagramHandle: professional.instagramHandle || '',
        photoUrl: professional.photoUrl || '',
        beforeAfterBefore: beforeAfter.before || '',
        beforeAfterAfter: beforeAfter.after || '',
        galleryPhotos,
      });
    }
  }, [professional]);
  
  const handleSave = async () => {
    setUploading(true);
    try {
      const beforeAfterPhotos = (formData.beforeAfterBefore && formData.beforeAfterAfter)
        ? JSON.stringify({
            before: formData.beforeAfterBefore,
            after: formData.beforeAfterAfter,
          })
        : null;
        
      const galleryPhotosJson = formData.galleryPhotos.length > 0
        ? JSON.stringify(formData.galleryPhotos)
        : null;
      
      await updateProfile.mutateAsync({
        displayName: formData.displayName,
        bio: formData.bio,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        instagramHandle: formData.instagramHandle,
        photoUrl: formData.photoUrl,
        beforeAfterPhotos,
        galleryPhotos: galleryPhotosJson,
      });
      
      toast.success('Perfil atualizado com sucesso!');
      setLocation('/');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setUploading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }
  
  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa ser um profissional para editar o perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-2">Editar Perfil</h1>
          <p className="text-gray-600">
            Atualize suas informações e fotos do seu card profissional
          </p>
        </div>

        <div className="grid gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Nome e descrição que aparecem no seu card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="displayName">Nome de Exibição</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Seu nome profissional"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio / Descrição</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Conte um pouco sobre você e seu trabalho..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>
                Como os clientes podem te encontrar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="5511987654321"
                />
              </div>
              
              <div>
                <Label htmlFor="instagram">Instagram (@ sem o @)</Label>
                <Input
                  id="instagram"
                  value={formData.instagramHandle}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  placeholder="seunome"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fotos */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos do Perfil</CardTitle>
              <CardDescription>
                Adicione URLs das suas fotos (use serviços como Imgur, Unsplash, etc)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="photoUpload">Foto de Perfil - Upload</Label>
                  <Input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (!file.type.startsWith('image/')) {
                        toast.error('Por favor, selecione uma imagem');
                        return;
                      }
                      
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error('Imagem muito grande. Máximo 10MB');
                        return;
                      }
                      
                      setUploading(true);
                      try {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          setFormData((prev) => ({
                            ...prev,
                            photoUrl: base64
                          }));
                          toast.success('Foto de perfil atualizada!');
                          e.target.value = '';
                          setUploading(false);
                        };
                        reader.onerror = () => {
                          toast.error('Erro ao ler arquivo');
                          setUploading(false);
                        };
                        reader.readAsDataURL(file);
                      } catch (error) {
                        toast.error('Erro ao fazer upload');
                        setUploading(false);
                      }
                    }}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Selecione uma foto do seu computador (máx 10MB)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="photoUrl">Ou Cole o Link da Foto</Label>
                  <Input
                    id="photoUrl"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>
                
                {formData.photoUrl && (
                  <div className="mt-2">
                    <Label>Preview</Label>
                    <img 
                      src={formData.photoUrl} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg mt-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Antes e Depois */}
          <Card>
            <CardHeader>
              <CardTitle>✨ Antes e Depois</CardTitle>
              <CardDescription>
                Mostre transformações do seu trabalho (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto ANTES */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="beforeUpload">Foto "Antes" - Upload</Label>
                  <Input
                    id="beforeUpload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (!file.type.startsWith('image/')) {
                        toast.error('Por favor, selecione uma imagem');
                        return;
                      }
                      
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error('Imagem muito grande. Máximo 10MB');
                        return;
                      }
                      
                      setUploading(true);
                      try {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          setFormData((prev) => ({
                            ...prev,
                            beforeAfterBefore: base64
                          }));
                          toast.success('Foto "Antes" adicionada!');
                          e.target.value = '';
                          setUploading(false);
                        };
                        reader.onerror = () => {
                          toast.error('Erro ao ler arquivo');
                          setUploading(false);
                        };
                        reader.readAsDataURL(file);
                      } catch (error) {
                        toast.error('Erro ao fazer upload');
                        setUploading(false);
                      }
                    }}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Selecione a foto "antes" (máx 10MB)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="beforePhoto">Ou Cole o Link da Foto "Antes"</Label>
                  <Input
                    id="beforePhoto"
                    value={formData.beforeAfterBefore}
                    onChange={(e) => setFormData({ ...formData, beforeAfterBefore: e.target.value })}
                    placeholder="https://exemplo.com/antes.jpg"
                  />
                </div>
                
                {formData.beforeAfterBefore && (
                  <div className="mt-2">
                    <Label>Preview "Antes"</Label>
                    <img 
                      src={formData.beforeAfterBefore} 
                      alt="Antes" 
                      className="w-32 h-32 object-cover rounded-lg mt-2"
                    />
                  </div>
                )}
              </div>
              
              {/* Foto DEPOIS */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="afterUpload">Foto "Depois" - Upload</Label>
                  <Input
                    id="afterUpload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (!file.type.startsWith('image/')) {
                        toast.error('Por favor, selecione uma imagem');
                        return;
                      }
                      
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error('Imagem muito grande. Máximo 10MB');
                        return;
                      }
                      
                      setUploading(true);
                      try {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          setFormData((prev) => ({
                            ...prev,
                            beforeAfterAfter: base64
                          }));
                          toast.success('Foto "Depois" adicionada!');
                          e.target.value = '';
                          setUploading(false);
                        };
                        reader.onerror = () => {
                          toast.error('Erro ao ler arquivo');
                          setUploading(false);
                        };
                        reader.readAsDataURL(file);
                      } catch (error) {
                        toast.error('Erro ao fazer upload');
                        setUploading(false);
                      }
                    }}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Selecione a foto "depois" (máx 10MB)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="afterPhoto">Ou Cole o Link da Foto "Depois"</Label>
                  <Input
                    id="afterPhoto"
                    value={formData.beforeAfterAfter}
                    onChange={(e) => setFormData({ ...formData, beforeAfterAfter: e.target.value })}
                    placeholder="https://exemplo.com/depois.jpg"
                  />
                </div>
                
                {formData.beforeAfterAfter && (
                  <div className="mt-2">
                    <Label>Preview "Depois"</Label>
                    <img 
                      src={formData.beforeAfterAfter} 
                      alt="Depois" 
                      className="w-32 h-32 object-cover rounded-lg mt-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Galeria de Fotos */}
          <Card>
            <CardHeader>
              <CardTitle>📸 Galeria de Fotos</CardTitle>
              <CardDescription>
                Adicione até 10 fotos dos seus trabalhos realizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fotos existentes */}
              {formData.galleryPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.galleryPhotos.map((photoUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photoUrl}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newPhotos = formData.galleryPhotos.filter((_, i) => i !== index);
                          setFormData({ ...formData, galleryPhotos: newPhotos });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Adicionar nova foto */}
              {formData.galleryPhotos.length < 10 && (
                <div className="space-y-4">
                  {/* Upload de arquivo */}
                  <div>
                    <Label htmlFor="fileUpload">Fazer Upload de Foto</Label>
                    <div className="flex gap-2">
                      <Input
                        id="fileUpload"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (!file.type.startsWith('image/')) {
                            toast.error('Por favor, selecione uma imagem');
                            return;
                          }
                          
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('Imagem muito grande. Máximo 10MB');
                            return;
                          }
                          
                          setUploading(true);
                          try {
                            // Converter para base64
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              setFormData((prev) => ({
                                ...prev,
                                galleryPhotos: [...prev.galleryPhotos, base64]
                              }));
                              toast.success('Foto adicionada!');
                              e.target.value = ''; // Limpar input
                              setUploading(false);
                            };
                            reader.onerror = () => {
                              toast.error('Erro ao ler arquivo');
                              setUploading(false);
                            };
                            reader.readAsDataURL(file);
                          } catch (error) {
                            toast.error('Erro ao fazer upload');
                            setUploading(false);
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Selecione uma foto do seu computador (máx 10MB)
                    </p>
                  </div>
                  
                  {/* OU adicionar por URL */}
                  <div>
                    <Label htmlFor="newGalleryPhoto">Ou Cole o Link da Foto</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newGalleryPhoto"
                        placeholder="https://exemplo.com/foto.jpg"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            if (input.value.trim()) {
                              setFormData((prev) => ({
                                ...prev,
                                galleryPhotos: [...prev.galleryPhotos, input.value.trim()]
                              }));
                              toast.success('Foto adicionada!');
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('newGalleryPhoto') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            setFormData((prev) => ({
                              ...prev,
                              galleryPhotos: [...prev.galleryPhotos, input.value.trim()]
                            }));
                            toast.success('Foto adicionada!');
                            input.value = '';
                          }
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 text-center">
                    {formData.galleryPhotos.length}/10 fotos adicionadas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={uploading}
              className="flex-1 h-12 text-lg bg-green-600 hover:bg-green-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="flex-1 h-12 text-lg"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

