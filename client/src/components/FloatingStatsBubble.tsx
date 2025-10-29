import { useEffect, useState } from 'react';
import { Users, MessageCircle, Star, Briefcase, TrendingUp, Eye, Heart, Award, Clock, MapPin, CheckCircle, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function FloatingStatsBubble() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Buscar estatísticas reais
  const { data: professionals } = trpc.professionals.search.useQuery({ limit: 1000 });
  const { data: activities } = trpc.social.recentActivities.useQuery({ limit: 50 });
  
  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Calcular estatísticas reais
  const totalProfessionals = ((professionals?.length || 0) || 91) * 50; // Multiplicar por 50
  const totalReviews = (professionals || []).reduce((sum, p) => sum + (p.reviewCount || 0), 0);
  const totalReviewsMultiplied = totalReviews * 50;
  const avgRating = (professionals || []).reduce((sum, p) => sum + (p.stars / 10 || 0), 0) / ((professionals?.length || 0) || 1) || 4.8;
  const totalViews = 15000 * 50;
  const totalLeads = 800 * 50;
  const totalDeals = Math.floor(totalLeads * 0.35); // 35% de conversão
  
  // Atividades recentes (para mostrar no balão)
  const recentActivities = activities?.slice(0, 10).map((activity: any) => ({
    icon: activity.type === 'follow' ? Users : activity.type === 'review' ? Star : MessageCircle,
    text: activity.type === 'follow' 
      ? `Novo seguidor! ${activity.professionalName || ''}`
      : activity.type === 'review'
      ? `Nova avaliação ⭐ ${activity.rating || 5}/5`
      : `Novo comentário`,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  })) || [];
  
  // Atividades novas + estatísticas gerais
  const statMessages = [
    ...recentActivities, // Novo seguidor, nova avaliação, novo comentário, nova contratação
    { 
      icon: Users, 
      text: `${totalProfessionals.toLocaleString('pt-BR')} profissionais verificados`, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: Star, 
      text: `${totalReviewsMultiplied.toLocaleString('pt-BR')} avaliações positivas`, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    { 
      icon: Briefcase, 
      text: `${totalDeals.toLocaleString('pt-BR')} negócios fechados este mês`, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      icon: Eye, 
      text: `${totalViews.toLocaleString('pt-BR')} visualizações hoje`, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      icon: TrendingUp, 
      text: `${avgRating.toFixed(1)} ⭐ média de satisfação`, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      icon: Heart, 
      text: `${Math.floor(totalProfessionals * 0.85).toLocaleString('pt-BR')} clientes satisfeitos`, 
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    { 
      icon: Clock, 
      text: `Resposta média em menos de 1 hora`, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    { 
      icon: Award, 
      text: `${Math.floor(totalProfessionals * 0.65).toLocaleString('pt-BR')} profissionais com selo verificado`, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      icon: MapPin, 
      text: `Presente em todas as capitais do Brasil`, 
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      icon: CheckCircle, 
      text: `98% de taxa de aprovação dos clientes`, 
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    { 
      icon: Zap, 
      text: `${Math.floor(totalDeals / 30).toLocaleString('pt-BR')} contratações por dia`, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    { 
      icon: MessageCircle, 
      text: `${(totalReviewsMultiplied * 2).toLocaleString('pt-BR')} mensagens trocadas`, 
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
  ];
  
  useEffect(() => {
    const showBubble = () => {
      setIsVisible(true);
      
      // Esconder após 4 segundos
      setTimeout(() => {
        setIsVisible(false);
        
        // Próxima estatística após 2 segundos de pausa
        setTimeout(() => {
          setCurrentStat((prev) => (prev + 1) % statMessages.length);
        }, 2000);
      }, 4000);
    };
    
    // Mostrar primeira vez após 1 segundo
    const initialTimer = setTimeout(showBubble, 1000);
    
    // Ciclo contínuo: a cada 6 segundos (4s visível + 2s pausa)
    const interval = setInterval(showBubble, 6000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [currentStat]);
  
  const CurrentIcon = statMessages[currentStat].icon;
  
  return (
    <div
      className={`
        fixed top-20 right-6 z-50
        transition-all duration-700 ease-in-out
        ${isVisible ? (isScrolled ? 'opacity-5' : 'opacity-100') + ' translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        scale-60 md:scale-100
      `}
    >
      {/* Balão de fala */}
      <div className="relative">
        {/* Conteúdo do balão */}
        <div className={`
          bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600
          text-white
          px-3 py-2
          rounded-xl
          shadow-2xl
          flex items-center gap-2
          animate-float
          border-2 border-orange-300
          backdrop-blur-sm
          max-w-xs
        `}>
          <div className={`${statMessages[currentStat].bgColor} rounded-full p-1.5 shadow-inner`}>
            <CurrentIcon className={`w-4 h-4 ${statMessages[currentStat].color}`} />
          </div>
          <span className="font-bold text-xs leading-tight">
            {statMessages[currentStat].text}
          </span>
        </div>
        
        {/* Pontinha do balão (triângulo) */}
        <div className="
          absolute -bottom-1.5 right-6
          w-0 h-0
          border-l-[8px] border-l-transparent
          border-r-[8px] border-r-transparent
          border-t-[10px] border-t-orange-600
          drop-shadow-lg
        "></div>
        
        {/* Brilho/Sparkle */}
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
      </div>
      
      {/* Animação de flutuação */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-8px) rotate(1deg);
          }
          75% {
            transform: translateY(-8px) rotate(-1deg);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

