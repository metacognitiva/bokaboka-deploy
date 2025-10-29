import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";

export function RankingsPreview() {
  const { data: professionals } = trpc.professionals.search.useQuery({
    limit: 50,
  });

  if (!professionals || professionals.length === 0) return null;

  // Sort by rating - top 3
  const topRated = [...professionals]
    .filter(p => p.reviewCount > 0)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 3);

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: "🥇", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    if (index === 1) return { icon: "🥈", color: "bg-gray-100 text-gray-800 border-gray-300" };
    if (index === 2) return { icon: "🥉", color: "bg-orange-100 text-orange-800 border-orange-300" };
    return { icon: "", color: "" };
  };

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold">Top 3</span>
          </div>
          <a href="/rankings" className="text-xs text-primary hover:underline">Ver ranking</a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        {topRated.map((professional, index) => {
          const rankBadge = getRankBadge(index);
          const displayStars = professional.stars / 10;

          return (
            <a key={professional.id} href={`/professional/${professional.uid}`} className="block">
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-all cursor-pointer border border-border/30">
                <Badge className={`${rankBadge.color} text-base font-bold px-2 py-0.5`}>
                  {rankBadge.icon}
                </Badge>
                
                <div className="flex-shrink-0">
                  {professional.photoUrl ? (
                    <img
                      src={professional.photoUrl}
                      alt={professional.displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-muted-foreground">
                        {professional.displayName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{professional.displayName}</h4>
                  <p className="text-xs text-muted-foreground truncate">{professional.category}</p>
                </div>

                <div className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold">{displayStars.toFixed(1)}</span>
                </div>
              </div>
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}

