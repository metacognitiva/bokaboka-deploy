import { eq, like, and, or, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, professionals, categories, reviews, leads, InsertProfessional, InsertCategory, InsertReview, InsertLead } from "../drizzle/schema-pg";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _sql: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _sql = postgres(process.env.DATABASE_URL);
      _db = drizzle(_sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL upsert using onConflictDoUpdate
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Professional queries
export async function searchProfessionals(params: {
  query?: string;
  category?: string;
  city?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(professionals.isActive, true),
    eq(professionals.verificationStatus, 'approved')
  ];

  if (params.query) {
    // Normalizar query para ignorar diferenças de gênero
    const normalizedQuery = params.query.toLowerCase()
      .replace(/óloga$/i, 'ólog')  // psicóloga → psicólog
      .replace(/ólogo$/i, 'ólog')  // psicólogo → psicólog
      .replace(/ista$/i, 'ist')    // dentista → dentist
      .replace(/gada$/i, 'gad')    // advogada → advogad
      .replace(/gado$/i, 'gad')    // advogado → advogad
      .replace(/dora$/i, 'dor')    // pintora → pintor
      .replace(/dor$/i, 'dor')     // pintor → pintor
      .replace(/a$/i, '')          // genérico: -a final
      .replace(/o$/i, '');         // genérico: -o final

    conditions.push(
      or(
        sql`LOWER(${professionals.displayName}) LIKE ${`%${normalizedQuery}%`}`,
        sql`LOWER(${professionals.category}) LIKE ${`%${normalizedQuery}%`}`,
        sql`LOWER(${professionals.bio}) LIKE ${`%${normalizedQuery}%`}`
      )!
    );
  }

  if (params.category) {
    conditions.push(eq(professionals.category, params.category));
  }

  if (params.city) {
    conditions.push(eq(professionals.city, params.city));
  }

  const result = await db
    .select()
    .from(professionals)
    .where(and(...conditions))
    .orderBy(desc(professionals.planType), desc(professionals.stars))
    .limit(params.limit || 20)
    .offset(params.offset || 0);

  return result;
}

export async function getProfessionalById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(professionals).where(eq(professionals.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getProfessionalByUid(uid: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(professionals).where(eq(professionals.uid, uid)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProfessional(data: InsertProfessional) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Set trial period to 5 days from now
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 5);

  const result = await db.insert(professionals).values({
    ...data,
    trialEndsAt,
  }).returning();

  return result[0];
}

export async function updateProfessional(id: number, data: Partial<InsertProfessional>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(professionals).set(data).where(eq(professionals.id, id));
}

// Category queries
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.displayOrder);

  return result;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(categories).values(data).returning();
  return result[0];
}

// Review queries
export async function getReviewsByProfessional(professionalId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.professionalId, professionalId))
    .orderBy(desc(reviews.createdAt));

  return result;
}

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(data).returning();

  // Update professional stats with weighted average
  const prof = await getProfessionalById(data.professionalId);
  if (prof) {
    const allReviews = await getReviewsByProfessional(data.professionalId);
    
    // Calcular média ponderada: avaliações com foto valem 2x
    const totalWeightedStars = allReviews.reduce((sum, r) => {
      const weight = r.weight || 1; // 1 = sem foto, 2 = com foto
      return sum + (r.rating * weight);
    }, 0);
    const totalWeight = allReviews.reduce((sum, r) => sum + (r.weight || 1), 0);
    const avgStars = Math.round((totalWeightedStars / totalWeight) * 10); // Store as 0-50

    await updateProfessional(data.professionalId, {
      stars: avgStars,
      reviewCount: allReviews.length,
    });
  }

  return result[0];
}

// Lead queries
export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(leads).values(data).returning();
  return result[0];
}

export async function getLeadsByProfessional(professionalId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(leads)
    .where(eq(leads.professionalId, professionalId))
    .orderBy(desc(leads.createdAt));

  return result;
}

// Helper to check if professional is in active period (trial or subscription)
export function isProfessionalActive(professional: typeof professionals.$inferSelect): boolean {
  const now = new Date();
  
  // Check if trial is still valid
  if (professional.trialEndsAt && professional.trialEndsAt > now) {
    return true;
  }
  
  // Check if subscription is still valid
  if (professional.subscriptionEndsAt && professional.subscriptionEndsAt > now) {
    return true;
  }
  
  return false;
}
