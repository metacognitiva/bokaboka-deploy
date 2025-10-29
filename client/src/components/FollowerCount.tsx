import { trpc } from "@/lib/trpc";
import { Users } from "lucide-react";

interface FollowerCountProps {
  professionalId: number;
}

export function FollowerCount({ professionalId }: FollowerCountProps) {
  const { data: count } = trpc.social.followerCount.useQuery({ professionalId });

  if (!count) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Users className="w-4 h-4" />
      <span>{count} {count === 1 ? 'seguidor' : 'seguidores'}</span>
    </div>
  );
}

