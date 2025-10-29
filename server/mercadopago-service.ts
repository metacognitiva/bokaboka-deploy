import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

/**
 * Serviço de integração com Mercado Pago
 * Gerencia assinaturas recorrentes para profissionais
 */

let client: MercadoPagoConfig | null = null;

/**
 * Inicializa o cliente do Mercado Pago
 */
export function initMercadoPago() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN não configurado');
    return null;
  }
  
  client = new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 5000,
    }
  });
  
  console.log('✅ Mercado Pago inicializado');
  return client;
}

/**
 * Planos disponíveis
 */
export const PLANS = {
  BASE: {
    id: 'base',
    name: 'Plano Base',
    price: 29.90,
    description: 'Perfil básico com informações essenciais',
    features: [
      'Perfil com foto e informações',
      'Contato via WhatsApp',
      'Avaliações de clientes',
      'Aparece nas buscas'
    ]
  },
  DESTAQUE: {
    id: 'destaque',
    name: 'Plano Destaque',
    price: 49.90,
    description: 'Perfil destacado com máxima visibilidade',
    features: [
      'Tudo do Plano Base',
      'Selo de Destaque',
      'Prioridade nas buscas',
      'Galeria de fotos',
      'Vídeo de apresentação',
      'Áudio de apresentação'
    ]
  }
} as const;

export type PlanType = 'base' | 'destaque';

/**
 * Cria uma preferência de pagamento recorrente
 */
export async function createSubscriptionPreference(
  professionalId: string,
  professionalName: string,
  professionalEmail: string,
  planType: PlanType,
  referralDiscount: number = 0 // Desconto em reais (ex: 10.00)
) {
  if (!client) {
    throw new Error('Mercado Pago não inicializado');
  }
  
  const plan = PLANS[planType.toUpperCase() as keyof typeof PLANS];
  
  if (!plan) {
    throw new Error('Plano inválido');
  }
  
  const preference = new Preference(client);
  
  const response = await preference.create({
    body: {
      items: [
        {
          id: plan.id,
          title: `BokaBoka - ${plan.name}`,
          description: plan.description,
          quantity: 1,
          unit_price: Math.max(0, plan.price - referralDiscount), // Aplica desconto
          currency_id: 'BRL',
        }
      ],
      payer: {
        name: professionalName,
        email: professionalEmail,
      },
      back_urls: {
        success: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/payment/success`,
        failure: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/payment/failure`,
        pending: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      external_reference: professionalId,
      statement_descriptor: 'BOKABOKA',
      metadata: {
        professional_id: professionalId,
        plan_type: planType,
      }
    }
  });
  
  return {
    preferenceId: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
  };
}

/**
 * Verifica o status de um pagamento
 */
export async function getPaymentStatus(paymentId: string) {
  if (!client) {
    throw new Error('Mercado Pago não inicializado');
  }
  
  const payment = new Payment(client);
  const response = await payment.get({ id: paymentId });
  
  return {
    id: response.id,
    status: response.status,
    statusDetail: response.status_detail,
    transactionAmount: response.transaction_amount,
    dateApproved: response.date_approved,
    externalReference: response.external_reference,
    metadata: response.metadata,
  };
}

/**
 * Processa notificação do webhook
 */
export async function processWebhookNotification(data: any) {
  console.log('📩 Webhook recebido:', data);
  
  const { type, data: notificationData } = data;
  
  if (type === 'payment') {
    const paymentId = notificationData.id;
    const paymentInfo = await getPaymentStatus(paymentId);
    
    console.log('💰 Status do pagamento:', paymentInfo);
    
    return {
      type: 'payment',
      paymentId,
      status: paymentInfo.status,
      professionalId: paymentInfo.externalReference,
      metadata: paymentInfo.metadata,
    };
  }
  
  return null;
}

/**
 * Calcula data de vencimento (30 dias)
 */
export function calculateExpirationDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

/**
 * Verifica se assinatura está ativa
 */
export function isSubscriptionActive(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
}

// Inicializar ao importar
initMercadoPago();

