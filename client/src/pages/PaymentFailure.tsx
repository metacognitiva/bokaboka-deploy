import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="w-20 h-20 text-red-600" />
          </div>
          <CardTitle className="text-3xl text-red-600">
            Pagamento Não Aprovado
          </CardTitle>
          <CardDescription className="text-lg">
            Não foi possível processar seu pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Seu pagamento não foi aprovado. Isso pode acontecer por diversos motivos:
          </p>
          <ul className="text-sm text-gray-600 text-left space-y-2">
            <li>• Saldo insuficiente</li>
            <li>• Dados do cartão incorretos</li>
            <li>• Limite de crédito excedido</li>
            <li>• Problemas com a operadora</li>
          </ul>
          <div className="pt-4 space-y-3">
            <Button
              onClick={() => setLocation('/planos')}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Tentar Novamente
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

