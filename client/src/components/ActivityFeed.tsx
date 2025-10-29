import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Award, TrendingUp } from "lucide-react";

export function ActivityFeed() {
  const { data: activities, isLoading } = trpc.social.recentActivities.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return null;
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "badge_earned":
        return <Award className="w-5 h-5 text-yellow-500" />;
      case "new_review":
        return <Star className="w-5 h-5 text-orange-500" />;
      case "milestone":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "badge_earned":
        return "bg-yellow-100 text-yellow-800";
      case "new_review":
        return "bg-orange-100 text-orange-800";
      case "milestone":
        return "bg-green-100 text-green-800";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
            
            return (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className={`p-2 rounded-full ${getActivityColor(activity.activityType)}`}>
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.content}
                  </p>
                  {metadata.badgeIcon && (
                    <Badge variant="secondary" className="mt-1">
                      {metadata.badgeIcon} {metadata.badgeName}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

