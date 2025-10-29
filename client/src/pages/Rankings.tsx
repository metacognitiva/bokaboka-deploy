import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, TrendingUp, Award, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Rankings() {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { data: professionals, isLoading } = trpc.professionals.search.useQuery({
    limit: 500, // Buscar mais para ter dados suficientes após filtrar
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando rankings...</div>
      </div>
    );
  }

  // Extrair cidades e categorias únicas
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set((professionals || []).map(p => p.city)));
    return uniqueCities.sort();
  }, [professionals]);
  
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set((professionals || []).map(p => p.category)));
    return uniqueCategories.sort();
  }, [professionals]);
  
  // Filtrar profissionais
  const filteredProfessionals = useMemo(() => {
    let filtered = professionals || [];
    
    if (selectedCity !== 'all') {
      filtered = filtered.filter(p => p.city === selectedCity);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    return filtered;
  }, [professionals, selectedCity, selectedCategory]);
  
  // Sort by rating
  const topRated = [...filteredProfessionals]
    .filter(p => p.reviewCount > 0)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 10);

  // Sort by review count
  const mostReviewed = [...filteredProfessionals]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 10);

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: "🥇", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    if (index === 1) return { icon: "🥈", color: "bg-gray-100 text-gray-800 border-gray-300" };
    if (index === 2) return { icon: "🥉", color: "bg-orange-100 text-orange-800 border-orange-300" };
    return { icon: `#${index + 1}`, color: "bg-muted text-muted-foreground" };
  };

  const RankingCard = ({ professional, index, type }: { professional: any; index: number; type: "rating" | "reviews" }) => {
    const rankBadge = getRankBadge(index);
    const displayStars = professional.stars / 10;
    const isTopThree = index < 3;

    return (
      <Link href={`/professional/${professional.uid}`}>
        <div className={`flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-all cursor-pointer border-2 ${
          isTopThree ? 'border-primary/30 shadow-lg hover:shadow-xl' : 'border-border'
        }`}>
          <div className="relative flex-shrink-0">
            <Badge className={`${rankBadge.color} text-2xl font-bold px-4 py-2 shadow-md`}>
              {rankBadge.icon}
            </Badge>
          </div>
          
          <div className="flex-shrink-0">
            {professional.photoUrl ? (
              <img
                src={professional.photoUrl}
                alt={professional.displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {professional.displayName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{professional.displayName}</h3>
            <p className="text-sm text-muted-foreground truncate">{professional.category}</p>
            <p className="text-xs text-muted-foreground">{professional.city}</p>
          </div>

          <div className="text-right">
            {type === "rating" ? (
              <>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold text-lg">{displayStars.toFixed(1)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{professional.reviewCount} avaliações</p>
              </>
            ) : (
              <>
                <div className="font-bold text-lg text-primary">{professional.reviewCount}</div>
                <p className="text-xs text-muted-foreground">avaliações</p>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="/logo-icon.png" alt="BokaBoka" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold gradient-text">BokaBoka</h1>
                <p className="text-xs text-muted-foreground">Rankings</p>
              </div>
            </div>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Rankings BokaBoka
          </h1>
          <p className="text-muted-foreground">Os melhores profissionais da plataforma</p>
        </div>
        
        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filtrar Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Filtro de Cidade */}
              <div>
                <label className="text-sm font-medium mb-2 block">Cidade</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro de Categoria */}
              <div>
                <label className="text-sm font-medium mb-2 block">Profissão</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as profissões" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as profissões</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Indicador de filtros ativos */}
            {(selectedCity !== 'all' || selectedCategory !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary">
                  {filteredProfessionals.length} profissionais encontrados
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCity('all');
                    setSelectedCategory('all');
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Rated */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Melhor Avaliados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topRated.map((professional, index) => (
                <RankingCard
                  key={professional.id}
                  professional={professional}
                  index={index}
                  type="rating"
                />
              ))}
            </CardContent>
          </Card>

          {/* Most Reviewed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Mais Avaliados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mostReviewed.map((professional, index) => (
                <RankingCard
                  key={professional.id}
                  professional={professional}
                  index={index}
                  type="reviews"
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

