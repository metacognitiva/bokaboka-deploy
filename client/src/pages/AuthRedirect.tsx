import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useRef } from "react";

/**
 * Página intermediária após OAuth callback
 * Garante redirecionamento correto baseado no userType
 * Usa múltiplas estratégias para compatibilidade com iOS Safari
 */
export default function AuthRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log("[AuthRedirect] State:", { 
      isAuthenticated, 
      loading, 
      userType: user?.userType,
      hasRedirected: hasRedirected.current
    });

    // Evita múltiplos redirects
    if (hasRedirected.current) {
      console.log("[AuthRedirect] Already redirected, skipping");
      return;
    }

    // Aguarda carregamento completo
    if (loading) {
      console.log("[AuthRedirect] Still loading...");
      return;
    }

    // Se não autenticado, volta para home
    if (!isAuthenticated || !user) {
      console.log("[AuthRedirect] Not authenticated, redirecting to /");
      hasRedirected.current = true;
      // Usa replace para não adicionar ao histórico
      window.location.replace("/");
      return;
    }

    // Determina o destino baseado no userType
    let destination = "/";
    
    if (user.userType === "none") {
      destination = "/escolher-tipo";
      console.log("[AuthRedirect] User needs to choose type");
    } else if (user.userType === "professional") {
      destination = "/";
      console.log("[AuthRedirect] Professional user");
    } else if (user.userType === "client") {
      destination = "/";
      console.log("[AuthRedirect] Client user");
    } else {
      destination = "/escolher-tipo";
      console.log("[AuthRedirect] Unknown userType, defaulting to choose page");
    }

    console.log("[AuthRedirect] Redirecting to:", destination);
    hasRedirected.current = true;

    // Usar replace (mais rápido e não adiciona ao histórico)
    window.location.replace(destination);

  }, [isAuthenticated, loading, user]);

  // Timeout de segurança: se não redirecionar em 3s, forçar redirect
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasRedirected.current && !loading) {
        console.log("[AuthRedirect] Timeout fallback - forcing redirect to /");
        window.location.replace("/");
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [loading]);

  // Renderiza tela de loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center space-y-4 p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
        <h2 className="text-2xl font-bold">Autenticando...</h2>
        <p className="text-muted-foreground">Por favor, aguarde enquanto configuramos sua conta.</p>
        {/* Mensagem de debug para iOS */}
        {!loading && user && (
          <p className="text-xs text-muted-foreground mt-4">
            Redirecionando para {user.userType === "none" ? "escolha de tipo" : "página inicial"}...
          </p>
        )}
      </div>
    </div>
  );
}

