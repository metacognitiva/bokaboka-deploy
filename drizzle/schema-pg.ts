import { serial, text, timestamp, varchar, boolean, decimal, integer, pgTable, pgEnum } from "drizzle-orm/pg-core";

// PostgreSQL Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const userTypeEnum = pgEnum("userType", ["client", "professional", "none"]);
export const badgeEnum = pgEnum("badge", ["none", "verified", "trusted"]);
export const planTypeEnum = pgEnum("planType", ["base", "destaque"]);
export const verificationStatusEnum = pgEnum("verificationStatus", ["pending", "approved", "rejected"]);

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
