import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Opcional: Verificar status do pagamento via query params
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id');
    console.log('Pagamento aprovado:', paymentId);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-600">
            Pagamento Aprovado!
          </CardTitle>
          <CardDescription className="text-lg">
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Parabéns! Seu perfil profissional já está ativo e visível para clientes.
          </p>
          <p className="text-sm text-gray-600">
            Você receberá um email de confirmação com os detalhes da sua assinatura.
          </p>
          <div className="pt-4 space-y-3">
            <Button
              onClick={() => setLocation('/')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Ver Meu Perfil
            </Button>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="w-full"
            >
              Voltar para Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

