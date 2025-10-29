import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["client", "professional", "none"]).default("none").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Professionals table - stores service providers
 */
export const professionals = mysqlTable("professionals", {
  id: int("id").autoincrement().primaryKey(),
  uid: varchar("uid", { length: 64 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }), // Latitude para geolocalização (-90 a +90)
  longitude: decimal("longitude", { precision: 11, scale: 8 }), // Longitude para geolocalização (-180 a +180)
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  bio: text("bio"),
  audioUrl: text("audioUrl"), // Audio description for professionals who can't write
  photoUrl: text("photoUrl"),
  galleryPhotos: text("galleryPhotos"), // JSON array of photo URLs
  beforeAfterPhotos: text("beforeAfterPhotos"), // JSON: { before: url, after: url }
  instagramVideoUrl: text("instagramVideoUrl"),
  instagramHandle: varchar("instagramHandle", { length: 100 }),
  stars: int("stars").default(0).notNull(), // Stored as integer (0-50) for 0-5 stars with 0.1 precision
  reviewCount: int("reviewCount").default(0).notNull(),
  responseTime: int("responseTime"), // Tempo médio de resposta em minutos (null = não calculado ainda)
  badge: mysqlEnum("badge", ["none", "verified", "trusted"]).default("none").notNull(),
  planType: mysqlEnum("planType", ["base", "destaque"]).default("base").notNull(),
  documentPhotoUrl: text("documentPhotoUrl"), // Document photo for verification
  selfiePhotoUrl: text("selfiePhotoUrl"), // Selfie with document
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected"]).default("pending"),
  aiVerificationResult: text("aiVerificationResult"), // JSON with full AI verification result
  trialEndsAt: timestamp("trialEndsAt"),
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = typeof professionals.$inferInsert;

/**
 * Reviews table - stores professional reviews
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  professionalId: int("professionalId").notNull(),
  userId: int("userId"),
  rating: int("rating").notNull(), // 1-5 stars
  weight: int("weight").default(1).notNull(), // 1 = sem foto, 2 = com foto (vale 2x no ranking)
  comment: text("comment"),
  audioUrl: text("audioUrl"),
  emoji: varchar("emoji", { length: 10 }),
  servicePhotoUrl: text("servicePhotoUrl"), // Foto do serviço realizado
  verificationPhotoUrl: text("verificationPhotoUrl"), // Selfie de verificação
  confirmationToken: varchar("confirmationToken", { length: 64 }), // Token único para link de confirmação
  isVerified: boolean("isVerified").default(false).notNull(), // Se foi verificado com foto
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Categories table - stores service categories
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Promotional codes table - cupons para cadastros gratuitos
 */
export const promoCodes = mysqlTable("promoCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  planType: mysqlEnum("planType", ["base", "destaque"]).notNull(),
  maxUses: int("maxUses").default(0).notNull(), // 0 = ilimitado
  currentUses: int("currentUses").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;

/**
 * Promo code usage tracking
 */
export const promoCodeUsage = mysqlTable("promoCodeUsage", {
  id: int("id").autoincrement().primaryKey(),
  promoCodeId: int("promoCodeId").notNull(),
  professionalId: int("professionalId").notNull(),
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

/**
 * Leads table - tracks contact requests
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  professionalId: int("professionalId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "contacted", "converted", "closed"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;


/**
 * Badges table - gamification achievements
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  requirement: int("requirement").notNull(), // Number needed to unlock
  type: mysqlEnum("type", ["services", "rating", "reviews", "referrals"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * Professional Badges - tracks earned badges
 */
export const professionalBadges = mysqlTable("professionalBadges", {
  id: int("id").autoincrement().primaryKey(),
  professionalId: int("professionalId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type ProfessionalBadge = typeof professionalBadges.$inferSelect;
export type InsertProfessionalBadge = typeof professionalBadges.$inferInsert;

/**
 * Follows table - users following professionals
 */
export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  professionalId: int("professionalId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

/**
 * Stories table - 24h temporary content from professionals
 */
export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  professionalId: int("professionalId").notNull(),
  mediaUrl: text("mediaUrl"), // Opcional: pode ser apenas texto/gradiente
  mediaType: mysqlEnum("mediaType", ["image", "video", "text"]).notNull(), // Adicionado "text"
  caption: text("caption"),
  
  // Novos campos para stories avançados
  backgroundColor: varchar("backgroundColor", { length: 50 }), // Cor de fundo (hex ou gradiente)
  textElements: text("textElements"), // JSON: [{ text, x, y, fontSize, color, fontFamily, rotation }]
  stickerElements: text("stickerElements"), // JSON: [{ emoji, x, y, size, rotation }]
  locationData: text("locationData"), // JSON: { city, neighborhood, x, y }
  professionBadge: text("professionBadge"), // JSON: { text, emoji, x, y, color }
  
  viewCount: int("viewCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

/**
 * Story Views - tracks who viewed stories
 */
export const storyViews = mysqlTable("storyViews", {
  id: int("id").autoincrement().primaryKey(),
  storyId: int("storyId").notNull(),
  userId: int("userId").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = typeof storyViews.$inferInsert;

/**
 * Analytics table - tracks professional profile metrics
 */
export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  professionalId: int("professionalId").notNull(),
  date: timestamp("date").notNull(),
  profileViews: int("profileViews").default(0).notNull(),
  whatsappClicks: int("whatsappClicks").default(0).notNull(),
  shareClicks: int("shareClicks").default(0).notNull(),
  photoViews: int("photoViews").default(0).notNull(),
  uniqueVisitors: int("uniqueVisitors").default(0).notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

/**
 * Referrals table - tracks professional referrals for rewards
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(), // Professional who referred
  referredId: int("referredId").notNull(), // Professional who was referred
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "completed", "rewarded"]).default("pending").notNull(),
  discountAmount: int("discountAmount").default(1000).notNull(), // Desconto em centavos (1000 = R$ 10,00)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Activity Feed - social feed of platform activities
 */
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  activityType: mysqlEnum("activityType", ["new_professional", "new_review", "badge_earned", "milestone"]).notNull(),
  professionalId: int("professionalId"),
  userId: int("userId"),
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON with additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;



/**
 * Reports table - user reports for moderation
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterUserId: int("reporterUserId"), // null if anonymous
  reportedProfessionalId: int("reportedProfessionalId").notNull(),
  category: mysqlEnum("category", [
    "fraud",
    "inappropriate_behavior",
    "service_not_delivered",
    "fake_profile",
    "harassment",
    "illegal_activity",
    "other"
  ]).notNull(),
  description: text("description").notNull(),
  evidenceUrls: text("evidenceUrls"), // JSON array of evidence URLs
  status: mysqlEnum("status", ["pending", "under_review", "resolved", "rejected"]).default("pending").notNull(),
  resolution: text("resolution"), // Admin notes on resolution
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedByAdminId: int("resolvedByAdminId"),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Moderation actions table - log of admin actions
 */
export const moderationActions = mysqlTable("moderation_actions", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  targetProfessionalId: int("targetProfessionalId").notNull(),
  actionType: mysqlEnum("actionType", [
    "warning",
    "suspend_7_days",
    "suspend_15_days",
    "suspend_30_days",
    "ban_permanent",
    "delete_account"
  ]).notNull(),
  reason: text("reason").notNull(),
  relatedReportId: int("relatedReportId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ModerationAction = typeof moderationActions.$inferSelect;
export type InsertModerationAction = typeof moderationActions.$inferInsert;



/**
 * Page views table - track site traffic for analytics
 */
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  path: varchar("path", { length: 255 }).notNull(),
  userId: int("userId"), // null for anonymous
  sessionId: varchar("sessionId", { length: 64 }),
  referrer: text("referrer"),
  userAgent: text("userAgent"),
  device: mysqlEnum("device", ["mobile", "desktop", "tablet"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;



/**
 * Payments table - tracks subscription payments
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  professionalId: int("professionalId").notNull(),
  amount: int("amount").notNull(), // Amount in cents (R$ 29.90 = 2990)
  planType: mysqlEnum("planType", ["base", "destaque"]).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["credit_card", "pix", "boleto"]),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }), // External payment gateway ID
  paymentGateway: varchar("paymentGateway", { length: 50 }), // stripe, mercadopago, etc
  subscriptionStartDate: timestamp("subscriptionStartDate"),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
  isRecurring: boolean("isRecurring").default(true).notNull(),
  nextBillingDate: timestamp("nextBillingDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;



/**
 * System Settings - configurações gerais do sistema
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy"), // Admin user ID
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

