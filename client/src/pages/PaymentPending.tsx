import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Clock } from 'lucide-react';

export default function PaymentPending() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Clock className="w-20 h-20 text-yellow-600" />
          </div>
          <CardTitle className="text-3xl text-yellow-600">
            Pagamento Pendente
          </CardTitle>
          <CardDescription className="text-lg">
            Aguardando confirmação do pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Seu pagamento está sendo processado. Isso pode levar alguns minutos.
          </p>
          <p className="text-sm text-gray-600">
            Você receberá um email assim que o pagamento for confirmado.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => setLocation('/')}
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

