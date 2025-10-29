import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Check, Loader2, AlertCircle, Tag } from 'lucide-react';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

export default function Checkout() {
  const [, params] = useRoute('/checkout/:professionalId/:planType');
  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValidated, setCodeValidated] = useState<{ valid: boolean; planType?: string; message: string } | null>(null);
  
  // Sistema de indicação
  const [referralCode, setReferralCode] = useState('');
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralValidated, setReferralValidated] = useState<{ valid: boolean; message: string } | null>(null);

  const professionalId = params?.professionalId || '';
  const planType = (params?.planType || 'base') as 'base' | 'destaque';

  const { data: plans } = trpc.payments.getPlans.useQuery();
  const createSubscription = trpc.payments.createSubscription.useMutation();
  const validatePromoCode = trpc.payments.validatePromoCode.useQuery(
    { code: promoCode },
    { enabled: false }
  );
  const activateWithPromoCode = trpc.payments.activateWithPromoCode.useMutation();
  
  // Queries de indicação
  const validateReferralCodeQuery = trpc.referrals.validateCode.useQuery(
    { code: referralCode },
    { enabled: false }
  );

  const plan = plans?.find(p => p.id === planType);

  useEffect(() => {
    if (!professionalId || !planType) {
      alert('Erro: Informações de pagamento inválidas');
      setLocation('/');
    }
  }, [professionalId, planType]);

  const handleValidateCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Digite um código promocional');
      return;
    }

    setValidatingCode(true);
    try {
      const result = await validatePromoCode.refetch();
      if (result.data) {
        setCodeValidated(result.data);
        if (result.data.valid) {
          toast.success(result.data.message);
        } else {
          toast.error(result.data.message);
        }
      }
    } catch (error) {
      toast.error('Erro ao validar código');
    } finally {
      setValidatingCode(false);
    }
  };

  const handleActivateWithCode = async () => {
    if (!codeValidated?.valid) {
      toast.error('Valide o código primeiro');
      return;
    }

    setLoading(true);
    try {
      const result = await activateWithPromoCode.mutateAsync({
        professionalId,
        code: promoCode,
      });

      toast.success(result.message);
      setTimeout(() => {
        setLocation('/');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao ativar plano');
      setLoading(false);
    }
  };
  
  const handleValidateReferral = async () => {
    if (!referralCode.trim()) {
      toast.error('Digite um código de indicação');
      return;
    }

    setValidatingReferral(true);
    try {
      const result = await validateReferralCodeQuery.refetch();
      if (result.data) {
        setReferralValidated(result.data);
        if (result.data.valid) {
          toast.success(result.data.message);
        } else {
          toast.error(result.data.message);
        }
      }
    } catch (error) {
      toast.error('Erro ao validar código');
    } finally {
      setValidatingReferral(false);
    }
  };

  const handlePayment = async () => {
    console.log('[Checkout] Iniciando pagamento:', { professionalId, planType });
    setLoading(true);
    try {
      const result = await createSubscription.mutateAsync({
        professionalId,
        planType,
        referralCode: referralValidated?.valid ? referralCode : undefined,
      });

      console.log('[Checkout] Resultado da criação:', result);

      if (result.success && result.initPoint) {
        console.log('[Checkout] Redirecionando para Mercado Pago:', result.initPoint);
        // Redirecionar para o Mercado Pago
        window.location.href = result.initPoint;
      } else {
        console.error('[Checkout] Erro: initPoint não retornado', result);
        throw new Error('Erro ao criar preferência de pagamento');
      }
    } catch (error: any) {
      console.error('[Checkout] Erro ao processar pagamento:', error);
      const errorMessage = error?.message || 'Não foi possível processar o pagamento';
      alert(`Erro: ${errorMessage}. Tente novamente.`);
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Plano não encontrado
            </CardTitle>
            <CardDescription>
              O plano selecionado não está disponível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/plans')} className="w-full">
              Ver Planos Disponíveis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Finalizar Assinatura</h1>
          <p className="text-gray-600">
            Você está a um passo de ativar seu perfil profissional
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resumo do Plano */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">
                  R$ {plan.price.toFixed(2)}
                </span>
                <span className="text-gray-600">/mês</span>
              </div>

              <div className="space-y-3 pt-4">
                <p className="font-semibold text-gray-700">Recursos inclusos:</p>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Pagamento Seguro</CardTitle>
              <CardDescription>
                Processado pelo Mercado Pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  ℹ️ Cobrança Recorrente
                </h3>
                <p className="text-sm text-blue-800">
                  Sua assinatura será renovada automaticamente todo mês. Você pode
                  cancelar a qualquer momento sem multa.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Plano</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Valor mensal</span>
                  <span className="font-semibold">R$ {plan.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Primeira cobrança</span>
                  <span className="font-semibold">Hoje</span>
                </div>
                {referralValidated?.valid && (
                  <div className="flex justify-between py-2 border-b text-green-600">
                    <span>Desconto (Indicação)</span>
                    <span className="font-semibold">- R$ 10,00</span>
                  </div>
                )}
                <div className="flex justify-between py-3 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">
                    R$ {(plan.price - (referralValidated?.valid ? 10 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Código Promocional */}
              <div className="border-t pt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Tag className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">
                        Tem um código promocional?
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Use <strong>bokagratuito</strong> ou <strong>bokadestaque</strong> para ativar seu plano gratuitamente!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Digite o código"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={loading || validatingCode}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleValidateCode}
                    disabled={loading || validatingCode || !promoCode.trim()}
                    variant="outline"
                  >
                    {validatingCode ? 'Validando...' : 'Validar'}
                  </Button>
                </div>

                {codeValidated && (
                  <div className={`p-3 rounded-lg mb-4 ${
                    codeValidated.valid 
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <p className="text-sm font-medium">{codeValidated.message}</p>
                    {codeValidated.valid && (
                      <p className="text-xs mt-1">
                        Plano: {codeValidated.planType === 'base' ? 'Base' : 'Destaque'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Código de Indicação */}
              {!codeValidated?.valid && (
                <div className="border-t pt-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-emerald-900 mb-1">
                          Foi indicado por alguém?
                        </h4>
                        <p className="text-sm text-emerald-800">
                          Use o código de indicação e ganhe <strong>R$ 10,00 de desconto</strong> na mensalidade!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Digite o código de indicação"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      disabled={loading || validatingReferral}
                      className="flex-1"
                      maxLength={8}
                    />
                    <Button
                      onClick={handleValidateReferral}
                      disabled={loading || validatingReferral || !referralCode.trim()}
                      variant="outline"
                    >
                      {validatingReferral ? 'Validando...' : 'Validar'}
                    </Button>
                  </div>

                  {referralValidated && (
                    <div className={`p-3 rounded-lg mb-4 ${
                      referralValidated.valid 
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <p className="text-sm font-medium">{referralValidated.message}</p>
                    </div>
                  )}
                </div>
              )}

              {codeValidated?.valid ? (
                <Button
                  onClick={handleActivateWithCode}
                  disabled={loading}
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Ativando...
                    </>
                  ) : (
                    'Ativar Plano Gratuitamente'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Pagar com Mercado Pago'
                  )}
                </Button>
              )}

              <p className="text-xs text-center text-gray-500">
                Ao clicar em "Pagar", você concorda com nossos{' '}
                <a href="#" className="text-green-600 hover:underline">
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a href="#" className="text-green-600 hover:underline">
                  Política de Privacidade
                </a>
              </p>

              <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <img
                  src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-xl@2x.png"
                  alt="Mercado Pago"
                  className="h-8"
                />
                <span className="text-sm text-gray-500">Pagamento 100% seguro</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation('/plans')}
            disabled={loading}
          >
            ← Voltar para Planos
          </Button>
        </div>
      </div>
    </div>
  );
}

