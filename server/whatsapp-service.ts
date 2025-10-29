/**
 * Serviço de notificações WhatsApp
 * 
 * IMPORTANTE: Este serviço usa a API do WhatsApp Business via link direto.
 * Para envios automáticos, você precisará integrar com:
 * - Twilio WhatsApp API
 * - WhatsApp Business API oficial
 * - Ou outro provedor de WhatsApp
 */

/**
 * Formatar número de telefone para WhatsApp (apenas números)
 */
function formatPhoneNumber(phone: string): string {
  // Remove tudo que não é número
  return phone.replace(/\D/g, '');
}

/**
 * Gerar link do WhatsApp com mensagem pré-preenchida
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/55${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Mensagem de aprovação
 */
export function getApprovalMessage(professionalName: string): string {
  return `🎉 Parabéns, ${professionalName}! Seu cadastro foi aprovado no BOKABOKA.

Agora você faz parte da nossa comunidade de profissionais que movimentam o mercado com confiança e qualidade.

Comece a divulgar seus serviços e conquistar novos clientes! 🚀

Acesse: https://bokaboka.com.br`;
}

/**
 * Mensagem de rejeição
 */
export function getRejectionMessage(professionalName: string): string {
  return `Olá, ${professionalName}!

Infelizmente, seu perfil ainda não se encaixa nos critérios do BOKABOKA neste momento.

Mas não desanime — nosso time está sempre reavaliando novas candidaturas.

Aperfeiçoe seu perfil e tente novamente em breve. 💪

Oportunidades estão sempre surgindo por aqui!`;
}

/**
 * Enviar notificação de aprovação
 * 
 * NOTA: Esta função retorna o link do WhatsApp.
 * Para envio automático, você precisará integrar com uma API de WhatsApp.
 */
export async function sendApprovalNotification(
  professionalName: string,
  whatsappNumber: string
): Promise<{ link: string; message: string }> {
  const message = getApprovalMessage(professionalName);
  const link = generateWhatsAppLink(whatsappNumber, message);
  
  // TODO: Integrar com API de WhatsApp para envio automático
  // Exemplo com Twilio:
  // await twilioClient.messages.create({
  //   from: 'whatsapp:+14155238886',
  //   to: `whatsapp:+55${formatPhoneNumber(whatsappNumber)}`,
  //   body: message
  // });
  
  console.log(`[WhatsApp] Aprovação - Link gerado para ${professionalName}: ${link}`);
  
  return { link, message };
}

/**
 * Enviar notificação de rejeição
 */
export async function sendRejectionNotification(
  professionalName: string,
  whatsappNumber: string
): Promise<{ link: string; message: string }> {
  const message = getRejectionMessage(professionalName);
  const link = generateWhatsAppLink(whatsappNumber, message);
  
  console.log(`[WhatsApp] Rejeição - Link gerado para ${professionalName}: ${link}`);
  
  return { link, message };
}

/**
 * Enviar mensagem personalizada
 */
export async function sendCustomMessage(
  whatsappNumber: string,
  message: string
): Promise<{ link: string }> {
  const link = generateWhatsAppLink(whatsappNumber, message);
  
  console.log(`[WhatsApp] Mensagem personalizada - Link: ${link}`);
  
  return { link };
}

