import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ProfessionalCard } from "@/components/ProfessionalCard";

import { RankingsPreview } from "@/components/RankingsPreview";
import { FloatingStatsBubble } from "@/components/FloatingStatsBubble";
import { NaBokaDoPovo } from "@/components/NaBokaDoPovo";
import SEO from "@/components/SEO";
import { Search, LogOut, Briefcase, User as UserIcon } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Home() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [categorySearch, setCategorySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [chooseTypeOpen, setChooseTypeOpen] = useState(false);
  const [showContinueBanner, setShowContinueBanner] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Redirecionar automaticamente para escolher tipo se usuário logado mas sem tipo
  useEffect(() => {
    if (!loading && isAuthenticated && user?.userType === "none") {
      console.log("[Home] User logged in but no type selected, showing banner and redirecting");
      // Mostrar banner imediatamente
      setShowContinueBanner(true);
      // Redirecionar após 1.5 segundos (tempo para ler o banner)
      const redirectTimer = setTimeout(() => {
        console.log("[Home] Redirecting to /escolher-tipo");
        window.location.href = "/escolher-tipo";
      }, 1500);
      return () => clearTimeout(redirectTimer);
    } else {
      setShowContinueBanner(false);
    }
  }, [loading, isAuthenticated, user?.userType]);

  // Fetch professionals
  const { data: professionals, isLoading: loadingProfessionals } = trpc.professionals.search.useQuery({
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    city: selectedCity || undefined,
    limit: 100,
    userLat: userLocation?.lat,
    userLon: userLocation?.lon,
    maxDistance: maxDistance,
  });

  // Fetch categories
  const { data: categories } = trpc.categories.list.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutos - categorias raramente mudam
  });

  // Extract unique cities from professionals for filter (optimized)
  const cities = useMemo(() => {
    if (!professionals || professionals.length === 0) return [];
    const citySet = new Set<string>();
    for (const p of professionals) {
      if (p.city) citySet.add(p.city);
    }
    return Array.from(citySet).sort();
  }, [professionals]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!categorySearch) return categories;
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch) return cities;
    return cities.filter(city =>
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [cities, citySearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is reactive, no need to do anything here
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoadingLocation(false);
        console.log("[Geolocation] User location:", position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("[Geolocation] Error:", error);
        setLoadingLocation(false);
        alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
      }
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setMaxDistance(undefined);
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  const handleChooseType = (type: "professional" | "client") => {
    if (!isAuthenticated) {
      // Se não autenticado, redireciona para login
      window.location.href = getLoginUrl();
      return;
    }
    // Se autenticado, vai direto para a página de escolha
    window.location.href = "/escolher-tipo";
  };

  const getCategoryLabel = () => {
    if (!selectedCategory) return "Categoria";
    const cat = categories?.find(c => c.name === selectedCategory);
    return cat ? `${cat.icon} ${cat.name}` : selectedCategory;
  };

  const getCityLabel = () => {
    return selectedCity || "Cidade/Estado";
  };

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BokaBoka",
    "url": "https://bokaboka-zwyrq4ic.manus.space",
    "description": "Encontre profissionais verificados e confiáveis no Brasil. Psicólogos, pintores, eletricistas e mais.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bokaboka-zwyrq4ic.manus.space/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BokaBoka",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bokaboka-zwyrq4ic.manus.space/logo.png"
      }
    }
  };

  return (
    <>
      <SEO schema={schemaOrg} />
      <FloatingStatsBubble />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="BokaBoka - Plataforma de Profissionais Verificados" loading="eager" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold gradient-text">{APP_TITLE}</h1>
              <p className="text-xs text-muted-foreground">Negociar é confiar.</p>
            </div>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-2">
            {/* Botão Inteligente Unificado */}
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Olá, {user?.name || "Usuário"}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Banner de Continuação de Cadastro */}
      {showContinueBanner && (
        <div className="bg-gradient-to-r from-green-500 to-orange-500 text-white py-4 px-4 shadow-lg">
          <div className="container flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg">🎉 Login realizado com sucesso!</p>
                <p className="text-sm opacity-90">Redirecionando para continuar seu cadastro...</p>
              </div>
            </div>
            <Button 
              variant="secondary"
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 font-bold"
              onClick={() => window.location.href = "/escolher-tipo"}
            >
              Continuar Cadastro →
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold text-balance">
              Encontre <span className="gradient-text">Profissionais Verificados</span> e Confiáveis no Brasil
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground text-balance">
              Negócios que nascem de pessoa pra pessoa, de confiança pra confiança
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Busque psicólogos, pintores, eletricistas, encanadores, diaristas e mais profissionais verificados. 
              Para contratar e ver telefone/WhatsApp, crie sua conta gratuita.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                ✓ Verificação obrigatória
              </span>
              {" • "}
              <span className="inline-flex items-center gap-1">
                🏆 Selos de confiança
              </span>
              {" • "}
              <span className="inline-flex items-center gap-1">
                ⭐ Avaliações com áudio
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Rankings Preview */}
      <section className="pb-8">
        <div className="container max-w-4xl">
          <RankingsPreview />
        </div>
      </section>

      {/* Search Section */}
      <section className="pb-8">
        <div className="container">
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="O que você procura? (psicólogo, pintor...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Category Filter with Search */}
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full md:w-[250px] h-12 justify-between"
                  >
                    {getCategoryLabel()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Buscar profissão..." 
                      value={categorySearch}
                      onValueChange={setCategorySearch}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhuma profissão encontrada.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setSelectedCategory("");
                            setCategoryOpen(false);
                          }}
                        >
                          Todas as profissões
                        </CommandItem>
                        {filteredCategories.map((cat) => (
                          <CommandItem
                            key={cat.id}
                            value={cat.name}
                            onSelect={() => {
                              setSelectedCategory(cat.name);
                              setCategoryOpen(false);
                            }}
                          >
                            {cat.icon} {cat.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* City Filter with Search */}
              <Popover open={cityOpen} onOpenChange={setCityOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full md:w-[250px] h-12 justify-between"
                  >
                    {getCityLabel()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Buscar cidade..." 
                      value={citySearch}
                      onValueChange={setCitySearch}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setSelectedCity("");
                            setCityOpen(false);
                          }}
                        >
                          Todas as cidades
                        </CommandItem>
                        {filteredCities.map((city) => (
                          <CommandItem
                            key={city}
                            value={city}
                            onSelect={() => {
                              setSelectedCity(city);
                              setCityOpen(false);
                            }}
                          >
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <Button type="submit" size="lg" className="h-12 px-8">
                Buscar
              </Button>
            </div>

            {/* Geolocation Controls */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!userLocation ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={loadingLocation}
                  className="gap-2"
                >
                  {loadingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Obtendo localização...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      📍 Usar minha localização
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Localização ativada
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearLocation}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Limpar
                  </Button>
                  
                  {/* Distance Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Raio:</span>
                    <div className="flex gap-1">
                      {[5, 10, 20, 50].map((dist) => (
                        <Button
                          key={dist}
                          type="button"
                          variant={maxDistance === dist ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMaxDistance(maxDistance === dist ? undefined : dist)}
                          className="h-8 px-3"
                        >
                          {dist}km
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Na Boka do Povo - Stories */}
      <section className="py-8 bg-muted/30">
        <div className="container">
          <NaBokaDoPovo />
        </div>
      </section>

      {/* Results Section */}
      <section className="flex-1 pb-16">
        <div className="container">
          {loadingProfessionals ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : professionals && professionals.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {professionals.length} profissionais encontrados
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {professionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                Nenhum profissional encontrado.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar os filtros de busca.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Dialog de Escolha de Tipo */}
      <Dialog open={chooseTypeOpen} onOpenChange={setChooseTypeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Como você deseja usar o BokaBoka?</DialogTitle>
            <DialogDescription>
              Escolha uma opção para continuar
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-start gap-2 hover:border-primary hover:bg-primary/5"
              onClick={() => handleChooseType("professional")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Sou Profissional</div>
                  <div className="text-xs text-muted-foreground">Quero oferecer meus serviços</div>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-start gap-2 hover:border-primary hover:bg-primary/5"
              onClick={() => handleChooseType("client")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <UserIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Sou Cliente</div>
                  <div className="text-xs text-muted-foreground">Quero contratar profissionais</div>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 BokaBoka. Negociar é confiar.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Segurança primeiro: verificação de documento + selfie e background check
            para todos os profissionais.
          </p>
          {user && user.role === 'admin' && (
            <div className="mt-4">
              <a 
                href="/admin" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Admin
              </a>
            </div>
          )}
        </div>
      </footer>
    </div>
    </>
  );
}

