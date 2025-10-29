import { getDb } from "./db";
import { referrals } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Gera um código de indicação único (alfanumérico, 8 caracteres)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem caracteres confusos (I, O, 0, 1)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Cria ou retorna código de indicação existente para um profissional
 */
export async function getOrCreateReferralCode(professionalId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se já tem código
  const existing = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, professionalId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].referralCode;
  }

  // Gerar novo código único
  let code = generateReferralCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      // Tentar inserir (vai falhar se código já existir)
      await db.insert(referrals).values({
        referrerId: professionalId,
        referredId: 0, // Placeholder, será atualizado quando alguém usar
        referralCode: code,
        status: "pending",
        discountAmount: 1000, // R$ 10,00
      });
      return code;
    } catch (error: any) {
      // Se código duplicado, gerar novo
      if (error.code === 'ER_DUP_ENTRY') {
        code = generateReferralCode();
        attempts++;
      } else {
        throw error;
      }
    }
  }

  throw new Error("Falha ao gerar código único após múltiplas tentativas");
}

/**
 * Valida código de indicação
 * Retorna o referrer ID se válido, null se inválido
 */
export async function validateReferralCode(code: string, newProfessionalId: number): Promise<{
  valid: boolean;
  referrerId?: number;
  message: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar código
  const result = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referralCode, code.toUpperCase()))
    .limit(1);

  if (result.length === 0) {
    return { valid: false, message: "Código de indicação inválido" };
  }

  const referral = result[0];

  // Não pode usar próprio código
  if (referral.referrerId === newProfessionalId) {
    return { valid: false, message: "Você não pode usar seu próprio código" };
  }

  // Verificar se já usou código antes
  const alreadyUsed = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referredId, newProfessionalId),
        eq(referrals.status, "completed")
      )
    )
    .limit(1);

  if (alreadyUsed.length > 0) {
    return { valid: false, message: "Você já usou um código de indicação anteriormente" };
  }

  return {
    valid: true,
    referrerId: referral.referrerId,
    message: "Código válido! Você e o indicador ganharão R$ 10,00 de desconto"
  };
}

/**
 * Aplica desconto de indicação e registra uso
 */
export async function applyReferralDiscount(
  code: string,
  referredId: number
): Promise<{
  success: boolean;
  discountAmount: number;
  referrerId?: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const validation = await validateReferralCode(code, referredId);
  if (!validation.valid || !validation.referrerId) {
    throw new Error(validation.message);
  }

  // Criar novo registro de uso
  await db.insert(referrals).values({
    referrerId: validation.referrerId,
    referredId: referredId,
    referralCode: code.toUpperCase(),
    status: "completed",
    discountAmount: 1000, // R$ 10,00
    completedAt: new Date(),
  });

  return {
    success: true,
    discountAmount: 1000, // em centavos
    referrerId: validation.referrerId,
  };
}

/**
 * Conta quantas pessoas um profissional indicou
 */
export async function getReferralCount(professionalId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerId, professionalId),
        eq(referrals.status, "completed")
      )
    );

  return result.length;
}

/**
 * Calcula total economizado com indicações
 */
export async function getTotalSavings(professionalId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerId, professionalId),
        eq(referrals.status, "completed")
      )
    );

  return result.reduce((sum, r) => sum + r.discountAmount, 0);
}

