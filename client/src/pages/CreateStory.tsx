import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, Upload, Type, Smile, MapPin, Palette, 
  RotateCw, ZoomIn, ZoomOut, Save, ArrowLeft 
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// Emojis por profissão
const PROFESSION_EMOJIS: Record<string, string[]> = {
  "Psicólogo": ["🧠", "💭", "🤝", "💚", "🌱", "🦋", "🌈", "✨"],
  "Cabeleireiro": ["💇‍♀️", "💇‍♂️", "✂️", "💈", "👩‍🦰", "💁‍♀️", "🎀", "💅"],
  "Manicure": ["💅", "💎", "✨", "🌸", "💖", "🎨", "🌺", "🦋"],
  "Personal Trainer": ["💪", "🏋️", "🤸", "⚡", "🔥", "🎯", "🏆", "💯"],
  "Nutricionista": ["🥗", "🍎", "🥑", "🥕", "🌿", "💚", "🍓", "🥤"],
  "Fisioterapeuta": ["🩺", "💆", "🤲", "💪", "🦴", "🏥", "❤️‍🩹", "✨"],
  "Dentista": ["🦷", "😁", "✨", "🪥", "💎", "🌟", "😊", "🦴"],
  "Esteticista": ["💆‍♀️", "✨", "🌸", "💎", "🧖‍♀️", "💅", "🌺", "🦋"],
  "Maquiador": ["💄", "💋", "✨", "🎨", "👁️", "💅", "🌟", "🦋"],
  "Massagista": ["💆", "🤲", "🌿", "💚", "🧘", "✨", "🕉️", "🌸"],
};

// Cores de fundo
const BACKGROUND_COLORS = [
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Laranja", value: "#F97316" },
  { name: "Verde", value: "#10B981" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Amarelo", value: "#F59E0B" },
  { name: "Gradiente 1", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Gradiente 2", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Gradiente 3", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
];

// Fontes
const FONTS = [
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Playfair", value: "Playfair Display, serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
];

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
}

interface StickerElement {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

interface LocationElement {
  city: string;
  neighborhood: string;
  x: number;
  y: number;
}

export default function CreateStory() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  

  
  // Estado do story
  const [mediaType, setMediaType] = useState<"image" | "video" | "text">("text");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_COLORS[0].value);
  const [caption, setCaption] = useState("");
  
  // Elementos
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [stickerElements, setStickerElements] = useState<StickerElement[]>([]);
  const [locationElement, setLocationElement] = useState<LocationElement | null>(null);
  
  // UI
  const [activeTab, setActiveTab] = useState<"media" | "text" | "stickers" | "location">("media");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  // Mutation
  const createStory = trpc.stories.create.useMutation({
    onSuccess: () => {
      toast.success("Story publicado com sucesso! 🎉");
      navigate("/");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });
  
  // Adicionar texto
  const addText = () => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: "Seu texto aqui",
      x: 50,
      y: 50,
      fontSize: 32,
      color: "#FFFFFF",
      fontFamily: FONTS[0].value,
      rotation: 0,
    };
    setTextElements([...textElements, newText]);
    setSelectedElement(newText.id);
  };
  
  // Adicionar sticker
  const addSticker = (emoji: string) => {
    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}`,
      emoji,
      x: 50,
      y: 50,
      size: 64,
      rotation: 0,
    };
    setStickerElements([...stickerElements, newSticker]);
    setSelectedElement(newSticker.id);
  };
  
  // Adicionar localização
  const addLocation = () => {
    setLocationElement({
      city: "Natal",
      neighborhood: "Ponta Negra",
      x: 50,
      y: 90,
    });
  };
  
  // Upload de mídia
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande! Máximo 10MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaUrl(reader.result as string);
      setMediaType(file.type.startsWith("video") ? "video" : "image");
    };
    reader.readAsDataURL(file);
  };
  
  // Publicar story
  const handlePublish = () => {
    createStory.mutate({
      mediaUrl: mediaUrl || null,
      mediaType,
      caption,
      backgroundColor: mediaType === "text" ? backgroundColor : undefined,
      textElements: JSON.stringify(textElements),
      stickerElements: JSON.stringify(stickerElements),
      locationData: locationElement ? JSON.stringify(locationElement) : undefined,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">✨ Criar Story</h1>
          <Button 
            onClick={handlePublish}
            disabled={createStory.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {createStory.isPending ? "Publicando..." : "Publicar"}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">📱 Preview</h2>
            <div 
              ref={canvasRef}
              className="relative w-full aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden"
              style={{
                background: mediaType === "text" ? backgroundColor : undefined,
                backgroundImage: mediaUrl && mediaType === "image" ? `url(${mediaUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Textos */}
              {textElements.map((text) => (
                <div
                  key={text.id}
                  className="absolute cursor-move"
                  style={{
                    left: `${text.x}%`,
                    top: `${text.y}%`,
                    fontSize: `${text.fontSize}px`,
                    color: text.color,
                    fontFamily: text.fontFamily,
                    transform: `rotate(${text.rotation}deg)`,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {text.text}
                </div>
              ))}
              
              {/* Stickers */}
              {stickerElements.map((sticker) => (
                <div
                  key={sticker.id}
                  className="absolute cursor-move"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    fontSize: `${sticker.size}px`,
                    transform: `rotate(${sticker.rotation}deg)`,
                  }}
                >
                  {sticker.emoji}
                </div>
              ))}
              
              {/* Localização */}
              {locationElement && (
                <div
                  className="absolute bg-white/90 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                  style={{
                    left: `${locationElement.x}%`,
                    top: `${locationElement.y}%`,
                  }}
                >
                  <MapPin className="w-4 h-4" />
                  {locationElement.city}, {locationElement.neighborhood}
                </div>
              )}
            </div>
          </Card>
          
          {/* Editor */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">🎨 Editor</h2>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeTab === "media" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("media")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Mídia
              </Button>
              <Button
                variant={activeTab === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("text")}
              >
                <Type className="w-4 h-4 mr-2" />
                Texto
              </Button>
              <Button
                variant={activeTab === "stickers" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("stickers")}
              >
                <Smile className="w-4 h-4 mr-2" />
                Stickers
              </Button>
              <Button
                variant={activeTab === "location" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("location")}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Local
              </Button>
            </div>
            
            {/* Conteúdo das tabs */}
            <div className="space-y-4">
              {activeTab === "media" && (
                <>
                  <div>
                    <Label>Upload de Foto/Vídeo</Label>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Ou escolha um fundo colorido</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {BACKGROUND_COLORS.map((bg) => (
                        <button
                          key={bg.name}
                          className="w-full aspect-square rounded-lg border-2 hover:scale-105 transition-transform"
                          style={{
                            background: bg.value,
                            borderColor: backgroundColor === bg.value ? "#000" : "transparent",
                          }}
                          onClick={() => {
                            setBackgroundColor(bg.value);
                            setMediaType("text");
                            setMediaUrl("");
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === "text" && (
                <>
                  <Button onClick={addText} className="w-full">
                    <Type className="w-4 h-4 mr-2" />
                    Adicionar Texto
                  </Button>
                  
                  {textElements.map((text) => (
                    <Card key={text.id} className="p-3 space-y-2">
                      <Input
                        value={text.text}
                        onChange={(e) => {
                          setTextElements(textElements.map(t => 
                            t.id === text.id ? { ...t, text: e.target.value } : t
                          ));
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Cor</Label>
                          <Input
                            type="color"
                            value={text.color}
                            onChange={(e) => {
                              setTextElements(textElements.map(t => 
                                t.id === text.id ? { ...t, color: e.target.value } : t
                              ));
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Tamanho</Label>
                          <Input
                            type="number"
                            value={text.fontSize}
                            onChange={(e) => {
                              setTextElements(textElements.map(t => 
                                t.id === text.id ? { ...t, fontSize: parseInt(e.target.value) } : t
                              ));
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => setTextElements(textElements.filter(t => t.id !== text.id))}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover
                      </Button>
                    </Card>
                  ))}
                </>
              )}
              
              {activeTab === "stickers" && (
                <>
                  <Label>Emojis da sua profissão</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {PROFESSION_EMOJIS["Psicólogo"]?.map((emoji, i) => (
                      <button
                        key={i}
                        className="text-3xl hover:scale-125 transition-transform"
                        onClick={() => addSticker(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  
                  {stickerElements.map((sticker) => (
                    <Card key={sticker.id} className="p-3 flex items-center justify-between">
                      <span className="text-3xl">{sticker.emoji}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setStickerElements(stickerElements.filter(s => s.id !== sticker.id))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </>
              )}
              
              {activeTab === "location" && (
                <>
                  {!locationElement ? (
                    <Button onClick={addLocation} className="w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      Adicionar Localização
                    </Button>
                  ) : (
                    <Card className="p-3 space-y-2">
                      <div>
                        <Label>Cidade</Label>
                        <Input
                          value={locationElement.city}
                          onChange={(e) => setLocationElement({ ...locationElement, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Bairro</Label>
                        <Input
                          value={locationElement.neighborhood}
                          onChange={(e) => setLocationElement({ ...locationElement, neighborhood: e.target.value })}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => setLocationElement(null)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover
                      </Button>
                    </Card>
                  )}
                </>
              )}
            </div>
            
            {/* Legenda */}
            <div className="mt-6">
              <Label>Legenda (opcional)</Label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva uma legenda para seu story..."
                rows={3}
                className="mt-2"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

