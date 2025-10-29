import { eq, and, desc } from "drizzle-orm";
import { follows, activities, badges, professionalBadges, analytics } from "../drizzle/schema";
import { getDb } from "./db";

// ===== FOLLOWS =====

export async function followProfessional(userId: number, professionalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(follows).values({
    userId,
    professionalId,
  });

  // Create activity
  await createActivity({
    activityType: "new_professional",
    professionalId,
    userId,
    content: "Novo seguidor!",
  });

  return { success: true };
}

export async function unfollowProfessional(userId: number, professionalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(follows).where(
    and(
      eq(follows.userId, userId),
      eq(follows.professionalId, professionalId)
    )
  );

  return { success: true };
}

export async function isFollowing(userId: number, professionalId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(follows).where(
    and(
      eq(follows.userId, userId),
      eq(follows.professionalId, professionalId)
    )
  ).limit(1);

  return result.length > 0;
}

export async function getFollowerCount(professionalId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select().from(follows).where(
    eq(follows.professionalId, professionalId)
  );

  return result.length;
}

export async function getFollowedProfessionals(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(follows).where(
    eq(follows.userId, userId)
  );

  return result;
}

// ===== ACTIVITIES =====

export async function createActivity(data: {
  activityType: "new_professional" | "new_review" | "badge_earned" | "milestone";
  professionalId?: number;
  userId?: number;
  content: string;
  metadata?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(activities).values(data);
  return result;
}

export async function getRecentActivities(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(limit);

  return result;
}

// ===== BADGES =====

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(badges);
}

export async function getProfessionalBadges(professionalId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    badge: badges,
    earnedAt: professionalBadges.earnedAt,
  })
  .from(professionalBadges)
  .innerJoin(badges, eq(badges.id, professionalBadges.badgeId))
  .where(eq(professionalBadges.professionalId, professionalId));

  return result;
}

export async function awardBadge(professionalId: number, badgeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already has badge
  const existing = await db.select().from(professionalBadges).where(
    and(
      eq(professionalBadges.professionalId, professionalId),
      eq(professionalBadges.badgeId, badgeId)
    )
  ).limit(1);

  if (existing.length > 0) return { alreadyHas: true };

  await db.insert(professionalBadges).values({
    professionalId,
    badgeId,
  });

  // Create activity
  const badge = await db.select().from(badges).where(eq(badges.id, badgeId)).limit(1);
  if (badge.length > 0) {
    await createActivity({
      activityType: "badge_earned",
      professionalId,
      content: `Conquistou o badge "${badge[0].name}"!`,
      metadata: JSON.stringify({ badgeId, badgeName: badge[0].name, badgeIcon: badge[0].icon }),
    });
  }

  return { success: true };
}

// ===== ANALYTICS =====

export async function trackProfileView(professionalId: number) {
  const db = await getDb();
  if (!db) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Try to update existing record
  const existing = await db.select().from(analytics).where(
    and(
      eq(analytics.professionalId, professionalId),
      eq(analytics.date, today)
    )
  ).limit(1);

  if (existing.length > 0) {
    await db.update(analytics)
      .set({ 
        profileViews: existing[0].profileViews + 1,
        uniqueVisitors: existing[0].uniqueVisitors + 1,
      })
      .where(eq(analytics.id, existing[0].id));
  } else {
    await db.insert(analytics).values({
      professionalId,
      date: today,
      profileViews: 1,
      uniqueVisitors: 1,
      whatsappClicks: 0,
      shareClicks: 0,
      photoViews: 0,
    });
  }
}

export async function trackWhatsAppClick(professionalId: number) {
  const db = await getDb();
  if (!db) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.select().from(analytics).where(
    and(
      eq(analytics.professionalId, professionalId),
      eq(analytics.date, today)
    )
  ).limit(1);

  if (existing.length > 0) {
    await db.update(analytics)
      .set({ whatsappClicks: existing[0].whatsappClicks + 1 })
      .where(eq(analytics.id, existing[0].id));
  }
}

export async function trackShareClick(professionalId: number) {
  const db = await getDb();
  if (!db) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.select().from(analytics).where(
    and(
      eq(analytics.professionalId, professionalId),
      eq(analytics.date, today)
    )
  ).limit(1);

  if (existing.length > 0) {
    await db.update(analytics)
      .set({ shareClicks: existing[0].shareClicks + 1 })
      .where(eq(analytics.id, existing[0].id));
  }
}

export async function getProfessionalAnalytics(professionalId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db.select()
    .from(analytics)
    .where(eq(analytics.professionalId, professionalId))
    .orderBy(desc(analytics.date))
    .limit(days);

  return result;
}

