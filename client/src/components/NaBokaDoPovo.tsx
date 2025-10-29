import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { StoriesViewer } from './StoriesViewer';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';

export function NaBokaDoPovo() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  
  const { data: stories, isLoading } = trpc.stories.getAll.useQuery();
  
  if (isLoading || !stories || stories.length === 0) {
    return null;
  }
  
  // Agrupar stories por profissional
  const groupedStories = stories.reduce((acc, story) => {
    const profId = story.professionalId;
    if (!acc[profId]) {
      acc[profId] = {
        professionalId: profId,
        professionalName: story.professionalName,
        professionalPhoto: story.professionalPhoto,
        professionalCategory: story.professionalCategory,
        stories: [],
      };
    }
    acc[profId].stories.push(story);
    return acc;
  }, {} as Record<number, {
    professionalId: number;
    professionalName: string;
    professionalPhoto: string;
    professionalCategory: string;
    stories: typeof stories;
  }>);
  
  const professionalGroups = Object.values(groupedStories);
  
  const handleStoryClick = (professionalId: number) => {
    setSelectedProfessionalId(professionalId);
    setViewerOpen(true);
  };
  
  const selectedStories = selectedProfessionalId 
    ? groupedStories[selectedProfessionalId]?.stories || []
    : [];
  
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">📸</span>
            Na Boka do Povo
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {professionalGroups.length} {professionalGroups.length === 1 ? 'profissional' : 'profissionais'}
            </p>
            {isAuthenticated && (
              <Button
                onClick={() => navigate('/create-story')}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
              >
                <Plus className="w-4 h-4 mr-1" />
                Criar Story
              </Button>
            )}
          </div>
        </div>
        
        {/* Stories carousel */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {professionalGroups.map((group) => (
            <button
              key={group.professionalId}
              onClick={() => handleStoryClick(group.professionalId)}
              className="flex-shrink-0 relative group"
            >
              {/* Story circle */}
              <div className="relative">
                {/* Gradient border (active story indicator) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 p-[3px] animate-pulse">
                  <div className="w-full h-full rounded-full bg-white" />
                </div>
                
                {/* Professional photo */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                  <img
                    src={group.professionalPhoto || '/placeholder-avatar.png'}
                    alt={group.professionalName}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Story count badge */}
                  {group.stories.length > 1 && (
                    <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                      {group.stories.length}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Professional name and category */}
              <div className="text-center mt-2 max-w-[80px]">
                <p className="text-xs font-semibold truncate">
                  {group.professionalName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {group.professionalCategory}
                </p>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>
      </div>
      
      {/* Stories Viewer */}
      {viewerOpen && selectedStories.length > 0 && (
        <StoriesViewer
          stories={selectedStories as any}
          initialIndex={0}
          onClose={() => {
            setViewerOpen(false);
            setSelectedProfessionalId(null);
          }}
        />
      )}
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}

