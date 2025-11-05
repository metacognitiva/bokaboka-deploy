import { getDb } from './db';
import { stories, storyViews, type Story, type InsertStory } from "../drizzle/schema-pg";
import { eq, and, gt, desc, sql, lt } from 'drizzle-orm';

/**
 * Criar novo story
 */
export async function createStory(data: {
  professionalId: number;
  mediaUrl?: string | null;
  mediaType: 'image' | 'video' | 'text';
  caption?: string;
  backgroundColor?: string;
  textElements?: string;
  stickerElements?: string;
  locationData?: string;
  professionBadge?: string;
}): Promise<Story> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Story expira em 24 horas
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  await db.insert(stories).values({
    ...data,
    expiresAt,
    viewCount: 0,
  });
  
  // Buscar story criado (último inserido)
  const [story] = await db
    .select()
    .from(stories)
    .where(eq(stories.professionalId, data.professionalId))
    .orderBy(desc(stories.id))
    .limit(1);
  
  return story as any;
}

/**
 * Listar stories ativos (não expirados) de um profissional
 */
export async function getActiveStoriesByProfessional(professionalId: number): Promise<Story[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const now = new Date();
  
  const result = await db
    .select()
    .from(stories)
    .where(
      and(
        eq(stories.professionalId, professionalId),
        gt(stories.expiresAt, now)
      )
    )
    .orderBy(desc(stories.createdAt));
  
  return result as any;
}

/**
 * Listar todos stories ativos (para feed "Na Boka do Povo")
 */
export async function getAllActiveStories(): Promise<(Story & { professionalName: string; professionalPhoto: string; professionalCategory: string })[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { professionals } = await import('../drizzle/schema');
  
  const now = new Date();
  
  const result = await db
    .select({
      id: stories.id,
      professionalId: stories.professionalId,
      mediaUrl: stories.mediaUrl,
      mediaType: stories.mediaType,
      caption: stories.caption,
      viewCount: stories.viewCount,
      expiresAt: stories.expiresAt,
      createdAt: stories.createdAt,
      professionalName: professionals.displayName,
      professionalPhoto: professionals.photoUrl,
      professionalCategory: professionals.category,
    })
    .from(stories)
    .innerJoin(professionals, eq(stories.professionalId, professionals.id))
    .where(
      and(
        gt(stories.expiresAt, now),
        eq(professionals.planType, 'destaque') // APENAS PLANO DESTAQUE
      )
    )
    .orderBy(desc(stories.createdAt));
  
  return result as any;
}

/**
 * Marcar story como visualizado
 */
export async function markStoryAsViewed(storyId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Verificar se já visualizou
  const existing = await db
    .select()
    .from(storyViews)
    .where(
      and(
        eq(storyViews.storyId, storyId),
        eq(storyViews.userId, userId)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    return; // Já visualizou
  }
  
  // Adicionar visualização
  await db.insert(storyViews).values({
    storyId,
    userId,
  });
  
  // Incrementar contador
  await db
    .update(stories)
    .set({
      viewCount: sql`${stories.viewCount} + 1`,
    })
    .where(eq(stories.id, storyId));
}

/**
 * Deletar stories expirados (executar via cron)
 */
export async function deleteExpiredStories(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const now = new Date();
  
  await db
    .delete(stories)
    .where(lt(stories.expiresAt, now));
  
  return 1; // Success
}

/**
 * Verificar se profissional tem stories ativos
 */
export async function hasActiveStories(professionalId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const now = new Date();
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(stories)
    .where(
      and(
        eq(stories.professionalId, professionalId),
        gt(stories.expiresAt, now)
      )
    );
  
  return (result[0]?.count || 0) > 0;
}

/**
 * Obter story por ID
 */
export async function getStoryById(storyId: number): Promise<Story | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db
    .select()
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);
  
  return result[0] || null;
}

