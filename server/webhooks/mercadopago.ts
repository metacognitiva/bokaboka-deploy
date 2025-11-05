import type { Request, Response } from 'express';
import { processWebhookNotification, calculateExpirationDate } from '../mercadopago-service';
import { getDb } from '../db';
import * as schema from "../drizzle/schema-pg";
import { eq } from 'drizzle-orm';

/**
 * Webhook do Mercado Pago
 * Recebe notificações de pagamentos aprovados/rejeitados
 */
export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  try {
    console.log('📩 Webhook Mercado Pago recebido:', req.body);
    
    const notification = await processWebhookNotification(req.body);
    
    if (!notification) {
      return res.status(200).json({ message: 'Notification ignored' });
    }
    
    if (notification.type === 'payment' && notification.status === 'approved') {
      // Pagamento aprovado - atualizar banco de dados
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }
      
      const professionalId = parseInt(notification.professionalId || '0');
      const planType = notification.metadata?.plan_type || 'base';
      
      // Registrar pagamento
      await db.insert(schema.payments).values({
        professionalId,
        amount: planType === 'destaque' ? 4990 : 2990, // Em centavos
        planType: planType as 'base' | 'destaque',
        paymentStatus: 'completed',
        transactionId: notification.paymentId,
        paymentGateway: 'mercadopago',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: calculateExpirationDate(),
        isRecurring: true,
        nextBillingDate: calculateExpirationDate(),
      });
      
      // Atualizar status do profissional
      await db
        .update(schema.professionals)
        .set({
          planType: planType as 'base' | 'destaque',
          isActive: true,
          subscriptionEndsAt: calculateExpirationDate(),
        })
        .where(eq(schema.professionals.id, professionalId));
      
      console.log(`✅ Pagamento aprovado para profissional ${professionalId}`);
    }
    
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

