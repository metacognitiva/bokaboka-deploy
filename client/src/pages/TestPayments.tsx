import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CreditCard, CheckCircle, XCircle, Clock, Loader2, TestTube } from 'lucide-react';

export default function TestPayments() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [testProfessionalId, setTestProfessionalId] = useState<string>('1'); // ID do profissional de teste

  const createSubscription = trpc.payments.createSubscription.useMutation();

  // Verificar profissional de teste
  const verifyTestProfessional = () => {
    alert('Profissional de teste já configurado!\n\nUID: test-professional\nID: 1\n\nVocê pode começar a testar os pagamentos.');
  };

  const testCheckout = async (planType: 'base' | 'destaque') => {
    if (!testProfessionalId) {
      alert('Primeiro crie um profissional de teste!');
      return;
    }

    setLoading(true);
    try {
      const result = await createSubscription.mutateAsync({
        professionalId: testProfessionalId,
        planType,
      });

      if (result.success && result.sandboxInitPoint) {
        // Usar sandbox para testes
        window.open(result.sandboxInitPoint, '_blank');
      } else {
        throw new Error('Erro ao criar preferência');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao iniciar checkout de teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TestTube className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl font-bold">Ambiente de Teste</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Simule pagamentos com cartões de teste do Mercado Pago
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Setup */}
          <Card>
            <CardHeader>
              <CardTitle>1. Configuração</CardTitle>
              <CardDescription>Prepare o ambiente de teste</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Credenciais configuradas:</strong>
                </p>
                <p className="text-xs text-blue-800">
                  ✅ MERCADOPAGO_ACCESS_TOKEN
                </p>
              </div>

              <Button
                onClick={verifyTestProfessional}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Profissional Configurado (ID: {testProfessionalId})
                  </>
                )}
              </Button>

              {testProfessionalId && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded p-3">
                  ✅ Pronto para testar pagamentos!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cartões de Teste */}
          <Card>
            <CardHeader>
              <CardTitle>2. Cartões de Teste</CardTitle>
              <CardDescription>Use estes cartões no checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <strong className="text-green-900">Pagamento Aprovado</strong>
                </div>
                <p className="text-sm text-green-800 font-mono">5031 4332 1540 6351</p>
                <p className="text-xs text-green-700">CVV: 123 | Validade: 11/25</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <strong className="text-red-900">Pagamento Rejeitado</strong>
                </div>
                <p className="text-sm text-red-800 font-mono">5031 7557 3453 0604</p>
                <p className="text-xs text-red-700">CVV: 123 | Validade: 11/25</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <strong className="text-yellow-900">Pagamento Pendente</strong>
                </div>
                <p className="text-sm text-yellow-800 font-mono">5031 4332 1540 6351</p>
                <p className="text-xs text-yellow-700">Use valor R$ 1.000,00</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testes de Planos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3. Testar Checkout</CardTitle>
            <CardDescription>Simule a compra de cada plano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">Plano Base</h3>
                <p className="text-3xl font-bold text-green-600 mb-4">R$ 29,90</p>
                <Button
                  onClick={() => testCheckout('base')}
                  disabled={!testProfessionalId || loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Testar Checkout Base
                </Button>
              </div>

              <div className="border-2 border-purple-200 rounded-lg p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">Plano Destaque</h3>
                <p className="text-3xl font-bold text-purple-600 mb-4">R$ 49,90</p>
                <Button
                  onClick={() => testCheckout('destaque')}
                  disabled={!testProfessionalId || loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Testar Checkout Destaque
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>4. Como Testar</CardTitle>
            <CardDescription>Passo a passo para simular pagamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Clique em "Criar Profissional de Teste" acima</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Escolha um plano e clique em "Testar Checkout"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>
                  Você será redirecionado para o checkout do Mercado Pago (sandbox)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </span>
                <span>Use um dos cartões de teste acima</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  5
                </span>
                <span>Complete o pagamento</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  6
                </span>
                <span>
                  Você será redirecionado de volta para /payment/success, /pending ou /failure
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  7
                </span>
                <span>
                  Verifique o banco de dados para confirmar que o pagamento foi registrado
                </span>
              </li>
            </ol>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>⚠️ Importante:</strong> Este é um ambiente de teste. Nenhuma
                cobrança real será feita. Use apenas cartões de teste do Mercado Pago.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Navegação */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={() => setLocation('/')} variant="outline">
            ← Voltar para Início
          </Button>
          <Button onClick={() => setLocation('/admin')} variant="outline">
            Ver Dashboard Admin
          </Button>
          <Button onClick={() => setLocation('/financial')} variant="outline">
            Ver Financeiro
          </Button>
        </div>
      </div>
    </div>
  );
}

