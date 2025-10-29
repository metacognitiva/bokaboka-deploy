import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface Story {
  id: number;
  professionalId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string | null;
  viewCount: number;
  expiresAt: Date;
  createdAt: Date;
  professionalName: string;
  professionalPhoto: string;
}

interface StoriesViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

export function StoriesViewer({ stories, initialIndex = 0, onClose }: StoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  
  const markViewed = trpc.stories.markViewed.useMutation();
  
  const currentStory = stories[currentIndex];
  const isVideo = currentStory?.mediaType === 'video';
  const duration = isVideo ? 20000 : 5000; // 20s para vídeo, 5s para imagem
  
  // Marcar como visualizado
  useEffect(() => {
    if (currentStory && user) {
      markViewed.mutate({ storyId: currentStory.id });
    }
  }, [currentStory?.id, user]);
  
  // Controlar progresso
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [currentIndex, isPaused, duration]);
  
  // Auto-play vídeo
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.play();
      
      videoRef.current.onended = () => {
        handleNext();
      };
    }
  }, [currentIndex, isVideo]);
  
  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') onClose();
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);
  
  if (!currentStory) return null;
  
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        {/* Progress bars */}
        <div className="flex gap-1 mb-4">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Professional info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentStory.professionalPhoto || '/placeholder-avatar.png'}
              alt={currentStory.professionalName}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-white font-semibold text-sm">{currentStory.professionalName}</p>
              <p className="text-white/70 text-xs">
                {new Date(currentStory.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Media */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={currentStory.mediaUrl}
            className="max-w-full max-h-full object-contain"
            playsInline
            onPause={() => setIsPaused(true)}
            onPlay={() => setIsPaused(false)}
          />
        ) : (
          <img
            src={currentStory.mediaUrl}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        )}
        
        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-0 right-0 px-6">
            <p className="text-white text-center text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              {currentStory.caption}
            </p>
          </div>
        )}
        
        {/* View count */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 text-white/80">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{currentStory.viewCount}</span>
        </div>
      </div>
      
      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition z-10"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      
      {currentIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition z-10"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
      
      {/* Touch areas for mobile */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
        onClick={handlePrev}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
        onClick={handleNext}
      />
    </div>
  );
}

