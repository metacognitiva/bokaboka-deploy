import { serial, text, timestamp, varchar, boolean, decimal, integer, pgTable, pgEnum } from "drizzle-orm/pg-core";

// PostgreSQL Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const userTypeEnum = pgEnum("userType", ["client", "professional", "none"]);
export const badgeEnum = pgEnum("badge", ["none", "verified", "trusted"]);
export const planTypeEnum = pgEnum("planType", ["base", "destaque"]);
export const verificationStatusEnum = pgEnum("verificationStatus", ["pending", "approved", "rejected"]);
export const mediaTypeEnum = pgEnum("mediaType", ["image", "video", "text"]);
export const activityTypeEnum = pgEnum("activityType", ["new_professional", "new_review", "badge_earned", "milestone"]);
export const typeEnum = pgEnum("type", ["services", "rating", "reviews", "referrals"]);
export const statusEnum = pgEnum("status", ["pending", "contacted", "converted", "closed"]);
export const paymentMethodEnum = pgEnum("paymentMethod", ["credit_card", "pix", "boleto"]);
export const paymentStatusEnum = pgEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]);

/**
 * Core user table
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  userType: userTypeEnum("userType").default("none").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Professionals table
 */
export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  uid: varchar("uid", { length: 64 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  bio: text("bio"),
  audioUrl: text("audioUrl"),
  photoUrl: text("photoUrl"),
  galleryPhotos: text("galleryPhotos"),
  beforeAfterPhotos: text("beforeAfterPhotos"),
  instagramVideoUrl: text("instagramVideoUrl"),
  instagramHandle: varchar("instagramHandle", { length: 100 }),
  stars: integer("stars").default(0).notNull(),
  reviewCount: integer("reviewCount").default(0).notNull(),
  responseTime: integer("responseTime"),
  badge: badgeEnum("badge").default("none").notNull(),
  planType: planTypeEnum("planType").default("base").notNull(),
  documentPhotoUrl: text("documentPhotoUrl"),
  selfiePhotoUrl: text("selfiePhotoUrl"),
  verificationStatus: verificationStatusEnum("verificationStatus").default("pending"),
  aiVerificationResult: text("aiVerificationResult"),
  trialEndsAt: timestamp("trialEndsAt"),
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = typeof professionals.$inferInsert;

/**
 * Reviews table
 */
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  professionalId: integer("professionalId").notNull(),
  userId: integer("userId"),
  rating: integer("rating").notNull(),
  weight: integer("weight").default(1).notNull(),
  comment: text("comment"),
  audioUrl: text("audioUrl"),
  emoji: varchar("emoji", { length: 10 }),
  servicePhotoUrl: text("servicePhotoUrl"),
  verificationPhotoUrl: text("verificationPhotoUrl"),
  confirmationToken: varchar("confirmationToken", { length: 64 }),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Categories table
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }),
  displayOrder: integer("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Social Features Tables

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  professionalId: integer("professionalId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  professionalId: integer("professionalId").notNull(),
  mediaUrl: text("mediaUrl"),
  mediaType: mediaTypeEnum("mediaType").notNull(),
  caption: text("caption"),
  backgroundColor: varchar("backgroundColor", { length: 50 }),
  textElements: text("textElements"),
  stickerElements: text("stickerElements"),
  locationData: text("locationData"),
  professionBadge: text("professionBadge"),
  viewCount: integer("viewCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

export const storyViews = pgTable("storyViews", {
  id: serial("id").primaryKey(),
  storyId: integer("storyId").notNull(),
  userId: integer("userId").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = typeof storyViews.$inferInsert;

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  activityType: activityTypeEnum("activityType").notNull(),
  professionalId: integer("professionalId"),
  userId: integer("userId"),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  requirement: integer("requirement").notNull(),
  type: typeEnum("type").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

export const professionalBadges = pgTable("professionalBadges", {
  id: serial("id").primaryKey(),
  professionalId: integer("professionalId").notNull(),
  badgeId: integer("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type ProfessionalBadge = typeof professionalBadges.$inferSelect;
export type InsertProfessionalBadge = typeof professionalBadges.$inferInsert;

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  professionalId: integer("professionalId").notNull(),
  date: timestamp("date").notNull(),
  profileViews: integer("profileViews").default(0).notNull(),
  whatsappClicks: integer("whatsappClicks").default(0).notNull(),
  shareClicks: integer("shareClicks").default(0).notNull(),
  photoViews: integer("photoViews").default(0).notNull(),
  uniqueVisitors: integer("uniqueVisitors").default(0).notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

// Payment and Referral Tables

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrerId").notNull(),
  referredId: integer("referredId").notNull(),
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  status: statusEnum("status").default("pending").notNull(),
  discountAmount: integer("discountAmount").default(1000).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

export const promoCodes = pgTable("promoCodes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  planType: planTypeEnum("planType").notNull(),
  maxUses: integer("maxUses").default(0).notNull(),
  currentUses: integer("currentUses").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;

export const promoCodeUsage = pgTable("promoCodeUsage", {
  id: serial("id").primaryKey(),
  promoCodeId: integer("promoCodeId").notNull(),
  professionalId: integer("professionalId").notNull(),
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

export type PromoCodeUsage = typeof promoCodeUsage.$inferSelect;
export type InsertPromoCodeUsage = typeof promoCodeUsage.$inferInsert;

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  professionalId: integer("professionalId").notNull(),
  amount: integer("amount").notNull(),
  planType: planTypeEnum("planType").notNull(),
  paymentMethod: paymentMethodEnum("paymentMethod"),
  paymentStatus: paymentStatusEnum("paymentStatus").default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  paymentGateway: varchar("paymentGateway", { length: 50 }),
  subscriptionStartDate: timestamp("subscriptionStartDate"),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
  isRecurring: boolean("isRecurring").default(true).notNull(),
  nextBillingDate: timestamp("nextBillingDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const systemSettings = pgTable("systemSettings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  updatedBy: integer("updatedBy"),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
