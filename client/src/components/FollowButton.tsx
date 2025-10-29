import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface FollowButtonProps {
  professionalId: number;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export function FollowButton({ professionalId, variant = "outline", size = "sm" }: FollowButtonProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: isFollowing, isLoading } = trpc.social.isFollowing.useQuery(
    { professionalId },
    { enabled: isAuthenticated }
  );

  const followMutation = trpc.social.follow.useMutation({
    onSuccess: () => {
      utils.social.isFollowing.invalidate({ professionalId });
      utils.social.followerCount.invalidate({ professionalId });
      toast.success("Profissional seguido!");
    },
    onError: () => {
      toast.error("Erro ao seguir profissional");
    },
  });

  const unfollowMutation = trpc.social.unfollow.useMutation({
    onSuccess: () => {
      utils.social.isFollowing.invalidate({ professionalId });
      utils.social.followerCount.invalidate({ professionalId });
      toast.success("Deixou de seguir");
    },
    onError: () => {
      toast.error("Erro ao deixar de seguir");
    },
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate({ professionalId });
    } else {
      followMutation.mutate({ professionalId });
    }
  };

  return (
    <Button
      variant={isFollowing ? "default" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || followMutation.isPending || unfollowMutation.isPending}
    >
      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
      {isFollowing ? "Seguindo" : "Seguir"}
    </Button>
  );
}

