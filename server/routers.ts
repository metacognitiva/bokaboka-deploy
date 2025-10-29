import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { eq, desc } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import {
  searchProfessionals,
  getProfessionalById,
  getProfessionalByUid,
  createProfessional,
  updateProfessional,
  getAllCategories,
  createCategory,
  getReviewsByProfessional,
  createReview,
  createLead,
  isProfessionalActive,
  getDb,
} from "./db";
import {
  followProfessional,
  unfollowProfessional,
  isFollowing,
  getFollowerCount,
  getFollowedProfessionals,
  getRecentActivities,
  getAllBadges,
  getProfessionalBadges,
  getProfessionalAnalytics,
  trackProfileView,
  trackWhatsAppClick,
  trackShareClick,
} from "./db-social";
import { validarCPF } from "./validators/cpf";
import {
  createSubscriptionPreference,
  getPaymentStatus,
  PLANS,
  type PlanType,
} from "./mercadopago-service";
import {
  createStory,
  getActiveStoriesByProfessional,
  getAllActiveStories,
  markStoryAsViewed,
  hasActiveStories,
  getStoryById,
} from "./story-service";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    setUserType: protectedProcedure
      .input(z.object({
        userType: z.enum(["client", "professional"]),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log("[setUserType] Setting user type:", { openId: ctx.user.openId, userType: input.userType });
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        await db.update(users)
          .set({ userType: input.userType })
          .where(eq(users.openId, ctx.user.openId));
        
        console.log("[setUserType] User type updated successfully");
        
        return { success: true };
      }),
  }),

  professionals: router({
    search: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          category: z.string().optional(),
          city: z.string().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
          userLat: z.number().optional(), // Latitude do usuário
          userLon: z.number().optional(), // Longitude do usuário
          maxDistance: z.number().optional(), // Distância máxima em km (5, 10, 20, 50)
        })
      )
      .query(async ({ input }) => {
        const results = await searchProfessionals(input);
        const { calculateDistance } = await import("../server/geolocation");
        
        // Add isActive flag and distance
        let professionalsWithDistance = results.map(prof => {
          let distance: number | null = null;
          
          // Calculate distance if user location and professional location are available
          if (input.userLat && input.userLon && prof.latitude && prof.longitude) {
            distance = calculateDistance(
              input.userLat,
              input.userLon,
              parseFloat(prof.latitude),
              parseFloat(prof.longitude)
            );
          }
          
          return {
            ...prof,
            isInActivePeriod: isProfessionalActive(prof),
            distance, // Distance in km or null
          };
        });
        
        // Filter by max distance if specified
        if (input.maxDistance && input.userLat && input.userLon) {
          professionalsWithDistance = professionalsWithDistance.filter(
            prof => prof.distance !== null && prof.distance <= input.maxDistance!
          );
        }
        
        // Sort by distance if user location is provided
        if (input.userLat && input.userLon) {
          professionalsWithDistance.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
        }
        
        return professionalsWithDistance;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const prof = await getProfessionalById(input.id);
        if (!prof) return null;
        
        return {
          ...prof,
          isInActivePeriod: isProfessionalActive(prof),
        };
      }),

    getByUid: publicProcedure
      .input(z.object({ uid: z.string() }))
      .query(async ({ input }) => {
        const prof = await getProfessionalByUid(input.uid);
        if (!prof) return null;
        
        return {
          ...prof,
          isInActivePeriod: isProfessionalActive(prof),
        };
      }),

    create: protectedProcedure
      .input(
        z.object({
          displayName: z.string(),
          category: z.string(),
          city: z.string(),
          phone: z.string().optional(),
          whatsapp: z.string().optional(),
          email: z.string().email().optional(),
          bio: z.string().optional(),
          audioUrl: z.string().optional(),
          photoUrl: z.string().optional(),
          instagramVideoUrl: z.string().optional(),
          instagramHandle: z.string().optional(),
          cpf: z.string().optional().refine(
            (cpf) => !cpf || validarCPF(cpf),
            { message: "CPF inválido" }
          ),
          documentPhotoUrl: z.string().optional(),
          selfiePhotoUrl: z.string().optional(),
          workPhotos: z.string().optional(), // JSON array de URLs
        })
      )
      .mutation(async ({ input }) => {
        const uid = Math.random().toString(36).slice(2, 10);
        
        // Se tiver fotos de verificação, executar análise com IA
        let aiVerificationResult = null;
        if (input.documentPhotoUrl && input.selfiePhotoUrl && input.cpf) {
          const { verifyProfessionalWithAI } = await import("./ai-verification");
          const verification = await verifyProfessionalWithAI(
            input.displayName,
            input.cpf,
            input.documentPhotoUrl,
            input.selfiePhotoUrl
          );
          aiVerificationResult = JSON.stringify(verification);
        }
        
        // Mapear workPhotos para galleryPhotos
        const professionalData: any = {
          ...input,
          uid,
          aiVerificationResult,
        };
        
        // Se tiver workPhotos, salvar como galleryPhotos
        if (input.workPhotos) {
          professionalData.galleryPhotos = input.workPhotos;
          delete professionalData.workPhotos;
        }
        
        return await createProfessional(professionalData);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          displayName: z.string().optional(),
          category: z.string().optional(),
          city: z.string().optional(),
          phone: z.string().optional(),
          whatsapp: z.string().optional(),
          email: z.string().optional(),
          bio: z.string().optional(),
          audioUrl: z.string().optional(),
          photoUrl: z.string().optional(),
          instagramVideoUrl: z.string().optional(),
          instagramHandle: z.string().optional(),
          planType: z.enum(["base", "destaque"]).optional(),
          galleryPhotos: z.string().nullable().optional(),
          beforeAfterPhotos: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProfessional(id, data);
        return { success: true };
      }),

    getPending: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const db = await getDb();
        if (!db) return [];
        const { professionals } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        return await db.select().from(professionals).where(eq(professionals.verificationStatus, 'pending'));
      }),

    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        // Buscar dados do profissional
        const professional = await getProfessionalById(input.id);
        if (!professional) {
          throw new Error('Profissional não encontrado');
        }
        
        // Aprovar profissional
        await updateProfessional(input.id, { verificationStatus: 'approved', badge: 'verified' });
        
        // Enviar notificação WhatsApp
        if (professional.whatsapp) {
          const { sendApprovalNotification } = await import('./whatsapp-service');
          const { link } = await sendApprovalNotification(
            professional.displayName,
            professional.whatsapp
          );
          console.log(`[Admin] Link WhatsApp de aprovação: ${link}`);
        }
        
        return { success: true };
      }),

    reject: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        // Buscar dados do profissional
        const professional = await getProfessionalById(input.id);
        if (!professional) {
          throw new Error('Profissional não encontrado');
        }
        
        // Rejeitar profissional
        await updateProfessional(input.id, { verificationStatus: 'rejected' });
        
        // Enviar notificação WhatsApp
        if (professional.whatsapp) {
          const { sendRejectionNotification } = await import('./whatsapp-service');
          const { link } = await sendRejectionNotification(
            professional.displayName,
            professional.whatsapp
          );
          console.log(`[Admin] Link WhatsApp de rejeição: ${link}`);
        }
        
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { professionals } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await db.delete(professionals).where(eq(professionals.id, input.id));
        return { success: true };
      }),
      
    // Obter perfil do profissional logado
    getMyProfile: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { professionals } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        const result = await db
          .select()
          .from(professionals)
          .where(eq(professionals.uid, ctx.user.openId))
          .limit(1);
          
        if (!result.length) {
          throw new Error('Perfil não encontrado');
        }
        
        return result[0];
      }),
      
    // Atualizar perfil do profissional logado
    updateProfile: protectedProcedure
      .input(
        z.object({
          displayName: z.string().optional(),
          bio: z.string().optional(),
          phone: z.string().optional(),
          whatsapp: z.string().optional(),
          instagramHandle: z.string().optional(),
          photoUrl: z.string().optional(),
          beforeAfterPhotos: z.string().nullable().optional(),
          galleryPhotos: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { professionals } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        // Remover campos undefined
        const updateData = Object.fromEntries(
          Object.entries(input).filter(([_, v]) => v !== undefined)
        );
        
        await db
          .update(professionals)
          .set(updateData)
          .where(eq(professionals.uid, ctx.user.openId));
          
        return { success: true, message: 'Perfil atualizado com sucesso!' };
      }),
  }),

  categories: router({
    list: publicProcedure.query(async () => {
      return await getAllCategories();
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          icon: z.string().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createCategory(input);
      }),
  }),

  reviews: router({
    getByProfessional: publicProcedure
      .input(z.object({ professionalId: z.number() }))
      .query(async ({ input }) => {
        return await getReviewsByProfessional(input.professionalId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          professionalId: z.number(),
          rating: z.number().min(1).max(5),
          comment: z.string().optional(),
          audioUrl: z.string().optional(),
          emoji: z.string().optional(),
          servicePhotoUrl: z.string().optional(),
          verificationPhotoUrl: z.string().optional(),
          confirmationToken: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Calcular peso: avaliação COM foto vale 2x
        const weight = input.servicePhotoUrl ? 2 : 1;
        
        return await createReview({
          ...input,
          userId: ctx.user.id,
          weight,
          isVerified: !!(input.servicePhotoUrl && input.verificationPhotoUrl),
        });
      }),
  }),

  leads: router({
    create: protectedProcedure
      .input(
        z.object({
          professionalId: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createLead({
          ...input,
          userId: ctx.user.id,
        });
      }),
  }),

  clients: router({
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        return await db.select()
          .from(users)
          .where(eq(users.userType, "client"));
      }),
  }),

  social: router({
    follow: protectedProcedure
      .input(z.object({ professionalId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await followProfessional(ctx.user.id, input.professionalId);
      }),

    unfollow: protectedProcedure
      .input(z.object({ professionalId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await unfollowProfessional(ctx.user.id, input.professionalId);
      }),

    isFollowing: protectedProcedure
      .input(z.object({ professionalId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await isFollowing(ctx.user.id, input.professionalId);
      }),

    followerCount: publicProcedure
      .input(z.object({ professionalId: z.number() }))
      .query(async ({ input }) => {
        return await getFollowerCount(input.professionalId);
      }),

    myFollows: protectedProcedure
      .query(async ({ ctx }) => {
        return await getFollowedProfessionals(ctx.user.id);
      }),

    recentActivities: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getRecentActivities(input.limit);
      }),
  }),

  badges: router({
    list: publicProcedure.query(async () => {
      return await getAllBadges();
    }),

    professional: publicProcedure
      .input(z.object({ professionalId: z.number() }))
      .query(async ({ input }) => {
        return await getProfessionalBadges(input.professionalId);
      }),
  }),

  reports: router({
    create: protectedProcedure
      .input(z.object({
        reportedProfessionalId: z.number(),
        category: z.enum(["fraud", "inappropriate_behavior", "service_not_delivered", "fake_profile", "harassment", "illegal_activity", "other"]),
        description: z.string(),
        anonymous: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { reports } = await import("../drizzle/schema");
        
        await db.insert(reports).values({
          reporterUserId: input.anonymous ? null : ctx.user.id,
          reportedProfessionalId: input.reportedProfessionalId,
          category: input.category,
          description: input.description,
          status: "pending",
        });
        
        return { success: true };
      }),

    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { reports, professionals } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        
        const allReports = await db.select({
          id: reports.id,
          reportedProfessionalId: reports.reportedProfessionalId,
          category: reports.category,
          description: reports.description,
          status: reports.status,
          createdAt: reports.createdAt,
          professionalName: professionals.displayName,
        })
        .from(reports)
        .leftJoin(professionals, eq(reports.reportedProfessionalId, professionals.id))
        .orderBy(desc(reports.createdAt));
        
        return allReports;
      }),

    resolve: protectedProcedure
      .input(z.object({
        reportId: z.number(),
        resolution: z.string(),
        action: z.enum(["warning", "suspend_7_days", "suspend_15_days", "suspend_30_days", "ban_permanent", "delete_account"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { reports, moderationActions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        // Update report status
        await db.update(reports)
          .set({
            status: "resolved",
            resolution: input.resolution,
            resolvedAt: new Date(),
            resolvedByAdminId: ctx.user.id,
          })
          .where(eq(reports.id, input.reportId));
        
        // Log moderation action if specified
        if (input.action) {
          const report = await db.select().from(reports).where(eq(reports.id, input.reportId)).limit(1);
          if (report.length > 0) {
            await db.insert(moderationActions).values({
              adminId: ctx.user.id,
              targetProfessionalId: report[0].reportedProfessionalId,
              actionType: input.action,
              reason: input.resolution,
              relatedReportId: input.reportId,
            });
          }
        }
        
        return { success: true };
      }),

    reject: protectedProcedure
      .input(z.object({
        reportId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { reports } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        await db.update(reports)
          .set({
            status: "rejected",
            resolution: input.reason,
            resolvedAt: new Date(),
            resolvedByAdminId: ctx.user.id,
          })
          .where(eq(reports.id, input.reportId));
        
        return { success: true };
      }),
  }),

  analytics: router({
    trackView: publicProcedure
      .input(z.object({ professionalId: z.number() }))
      .mutation(async ({ input }) => {
        await trackProfileView(input.professionalId);
        return { success: true };
      }),

    trackWhatsApp: publicProcedure
      .input(z.object({ professionalId: z.number() }))
      .mutation(async ({ input }) => {
        await trackWhatsAppClick(input.professionalId);
        return { success: true };
      }),

    trackShare: publicProcedure
      .input(z.object({ professionalId: z.number() }))
      .mutation(async ({ input }) => {
        await trackShareClick(input.professionalId);
        return { success: true };
      }),

    getProfessionalStats: protectedProcedure
      .input(z.object({ professionalId: z.number(), days: z.number().optional() }))
      .query(async ({ input }) => {
        return await getProfessionalAnalytics(input.professionalId, input.days);
      }),

    // Admin analytics endpoints
    getPlatformStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { professionals, reviews, users } = await import("../drizzle/schema");
        const { sql, eq } = await import("drizzle-orm");
        
        // Total professionals
        const totalProfessionals = await db.select({ count: sql<number>`count(*)` })
          .from(professionals);
        
        // Total reviews
        const totalReviews = await db.select({ count: sql<number>`count(*)` })
          .from(reviews);
        
        // Total users (clients)
        const totalUsers = await db.select({ count: sql<number>`count(*)` })
          .from(users)
          .where(eq(users.userType, 'client'));
        
        return {
          totalProfessionals: totalProfessionals[0]?.count || 0,
          totalReviews: totalReviews[0]?.count || 0,
          totalClients: totalUsers[0]?.count || 0,
          pageViews: [], // Google Analytics will handle this
          deviceStats: [], // Google Analytics will handle this
        };
      }),

    getConversionFunnel: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { analytics: analyticsTable, reviews } = await import("../drizzle/schema");
        const { sql } = await import("drizzle-orm");
        
        // Aggregate all analytics data
        const totals = await db.select({
          profileViews: sql<number>`COALESCE(SUM(${analyticsTable.profileViews}), 0)`,
          whatsappClicks: sql<number>`COALESCE(SUM(${analyticsTable.whatsappClicks}), 0)`,
          shareClicks: sql<number>`COALESCE(SUM(${analyticsTable.shareClicks}), 0)`,
        })
        .from(analyticsTable);
        
        // Total reviews as final conversion
        const totalReviews = await db.select({ count: sql<number>`count(*)` })
          .from(reviews);
        
        const profileViews = Number(totals[0]?.profileViews || 0);
        const whatsappClicks = Number(totals[0]?.whatsappClicks || 0);
        const reviewCount = Number(totalReviews[0]?.count || 0);
        
        // Estimate visitors (Google Analytics would provide real data)
        const estimatedVisitors = profileViews > 0 ? Math.floor(profileViews * 1.5) : 100;
        
        return {
          visitors: estimatedVisitors,
          profileViews,
          whatsappClicks,
          reviews: reviewCount,
        };
      }),

    getFinancialStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { payments, professionals } = await import("../drizzle/schema");
        const { sql, gte, eq } = await import("drizzle-orm");
        
        // Get date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Total revenue
        const totalRevenue = await db.select({
          total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`
        })
        .from(payments)
        .where(eq(payments.paymentStatus, "completed"));
        
        // Revenue by plan
        const revenueByPlan = await db.select({
          planType: payments.planType,
          total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
          count: sql<number>`count(*)`
        })
        .from(payments)
        .where(eq(payments.paymentStatus, "completed"))
        .groupBy(payments.planType);
        
        // Recent payments
        const recentPayments = await db.select()
          .from(payments)
          .where(gte(payments.createdAt, thirtyDaysAgo))
          .orderBy(sql`${payments.createdAt} DESC`)
          .limit(50);
        
        // Active subscriptions
        const activeSubscriptions = await db.select({
          planType: professionals.planType,
          count: sql<number>`count(*)`
        })
        .from(professionals)
        .where(eq(professionals.isActive, true))
        .groupBy(professionals.planType);
        
        // MRR calculation (Monthly Recurring Revenue)
        const basePlanPrice = 2990; // R$ 29.90 in cents
        const destaquePlanPrice = 4990; // R$ 49.90 in cents
        
        const baseCount = activeSubscriptions.find(s => s.planType === "base")?.count || 0;
        const destaqueCount = activeSubscriptions.find(s => s.planType === "destaque")?.count || 0;
        
        const mrr = (Number(baseCount) * basePlanPrice) + (Number(destaqueCount) * destaquePlanPrice);
        
        return {
          totalRevenue: Number(totalRevenue[0]?.total || 0),
          revenueByPlan,
          recentPayments,
          activeSubscriptions,
          mrr,
          projectedAnnualRevenue: mrr * 12,
        };
      }),
  }),

  // Sistema de Indicação
  referrals: router({
    // Obter ou criar código de indicação
    getMyCode: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateReferralCode } = await import('./referral-service');
      
      // Buscar profissional do usuário
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const professional = await db
        .select()
        .from(schema.professionals)
        .where(eq(schema.professionals.uid, ctx.user.openId))
        .limit(1);
      
      if (!professional.length) {
        throw new Error('Profissional não encontrado');
      }
      
      const code = await getOrCreateReferralCode(professional[0].id);
      return { code };
    }),

    // Validar código de indicação
    validateCode: protectedProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input, ctx }) => {
        const { validateReferralCode } = await import('./referral-service');
        
        // Buscar profissional do usuário
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const professional = await db
          .select()
          .from(schema.professionals)
          .where(eq(schema.professionals.uid, ctx.user.openId))
          .limit(1);
        
        if (!professional.length) {
          throw new Error('Profissional não encontrado');
        }
        
        return await validateReferralCode(input.code, professional[0].id);
      }),

    // Obter estatísticas de indicações
    getMyStats: protectedProcedure.query(async ({ ctx }) => {
      const { getReferralCount, getTotalSavings } = await import('./referral-service');
      
      // Buscar profissional do usuário
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const professional = await db
        .select()
        .from(schema.professionals)
        .where(eq(schema.professionals.uid, ctx.user.openId))
        .limit(1);
      
      if (!professional.length) {
        return { count: 0, totalSavings: 0 };
      }
      
      const count = await getReferralCount(professional[0].id);
      const totalSavings = await getTotalSavings(professional[0].id);
      
      return { count, totalSavings };
    }),
  }),

  // Mercado Pago - Pagamentos e Assinaturas
  payments: router({
    // Listar planos disponíveis
    getPlans: publicProcedure.query(() => {
      return Object.values(PLANS);
    }),

    // Buscar todos os pagamentos (admin)
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const db = await getDb();
      if (!db) return [];
      const { payments } = await import('../drizzle/schema');
      return await db.select().from(payments);
    }),

    // Criar preferência de pagamento
    createSubscription: protectedProcedure
      .input(
        z.object({
          professionalId: z.string(),
          planType: z.enum(['base', 'destaque']),
          referralCode: z.string().optional(), // Código de indicação
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Buscar dados do profissional
        const professional = await db
          .select()
          .from(schema.professionals)
          .where(eq(schema.professionals.id, parseInt(input.professionalId)))
          .limit(1);
        
        if (!professional.length) {
          throw new Error('Profissional não encontrado');
        }
        
        const prof = professional[0];
        const userEmail = ctx.user?.email || prof.email || 'contato@bokaboka.com';
        
        // Aplicar desconto de indicação se houver
        let referralDiscount = 0;
        if (input.referralCode) {
          const { applyReferralDiscount } = await import('./referral-service');
          try {
            const result = await applyReferralDiscount(input.referralCode, prof.id);
            if (result.success) {
              referralDiscount = result.discountAmount / 100; // Converter centavos para reais
            }
          } catch (error) {
            console.error('Erro ao aplicar desconto de indicação:', error);
            // Não bloquear pagamento se houver erro no desconto
          }
        }
        
        // Criar preferência no Mercado Pago
        const preference = await createSubscriptionPreference(
          prof.id.toString(),
          prof.displayName,
          userEmail,
          input.planType as PlanType,
          referralDiscount
        );
        
        return {
          success: true,
          preferenceId: preference.preferenceId,
          initPoint: preference.initPoint,
          sandboxInitPoint: preference.sandboxInitPoint,
        };
      }),

    // Validar código promocional
    validatePromoCode: protectedProcedure
      .input(
        z.object({
          code: z.string(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const promoCode = await db
          .select()
          .from(schema.promoCodes)
          .where(eq(schema.promoCodes.code, input.code.toLowerCase()))
          .limit(1);
        
        if (!promoCode.length) {
          return { valid: false, message: 'Código inválido' };
        }
        
        const code = promoCode[0];
        
        if (!code.isActive) {
          return { valid: false, message: 'Código desativado' };
        }
        
        if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
          return { valid: false, message: 'Código expirado' };
        }
        
        if (code.maxUses > 0 && code.currentUses >= code.maxUses) {
          return { valid: false, message: 'Código esgotado' };
        }
        
        return {
          valid: true,
          planType: code.planType,
          message: 'Código válido!',
        };
      }),

    // Ativar plano com código promocional
    activateWithPromoCode: protectedProcedure
      .input(
        z.object({
          professionalId: z.string(),
          code: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Validar código
        const promoCode = await db
          .select()
          .from(schema.promoCodes)
          .where(eq(schema.promoCodes.code, input.code.toLowerCase()))
          .limit(1);
        
        if (!promoCode.length || !promoCode[0].isActive) {
          throw new Error('Código inválido');
        }
        
        const code = promoCode[0];
        const professionalId = parseInt(input.professionalId);
        
        // Verificar se já usou este código
        const alreadyUsed = await db
          .select()
          .from(schema.promoCodeUsage)
          .where(
            eq(schema.promoCodeUsage.professionalId, professionalId)
          )
          .limit(1);
        
        if (alreadyUsed.length > 0) {
          throw new Error('Você já utilizou um código promocional');
        }
        
        // Ativar profissional com o plano
        const subscriptionEndsAt = new Date();
        subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 10); // 10 anos
        
        await db
          .update(schema.professionals)
          .set({
            planType: code.planType,
            subscriptionEndsAt,
            isActive: true,
            verificationStatus: 'approved', // Aprovar automaticamente
          })
          .where(eq(schema.professionals.id, professionalId));
        
        // Registrar uso do código
        await db.insert(schema.promoCodeUsage).values({
          promoCodeId: code.id,
          professionalId,
        });
        
        // Incrementar contador de usos
        await db
          .update(schema.promoCodes)
          .set({
            currentUses: code.currentUses + 1,
          })
          .where(eq(schema.promoCodes.id, code.id));
        
        return {
          success: true,
          planType: code.planType,
          message: 'Plano ativado com sucesso!',
        };
      }),

    // Verificar status de pagamento
    checkPaymentStatus: protectedProcedure
      .input(
        z.object({
          paymentId: z.string(),
        })
      )
      .query(async ({ input }) => {
        const status = await getPaymentStatus(input.paymentId);
        return status;
      }),

    // Listar pagamentos do profissional
    getMyPayments: protectedProcedure
      .input(
        z.object({
          professionalId: z.number(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const payments = await db
          .select()
          .from(schema.payments)
          .where(eq(schema.payments.professionalId, input.professionalId))
          .orderBy(desc(schema.payments.createdAt))
          .limit(50);
        
        return payments;
      }),
  }),
  
  // Stories "Na Boka do Povo"
  stories: router({
    // Criar story (apenas profissionais)
    create: protectedProcedure
      .input(
        z.object({
          mediaUrl: z.string().url().optional().nullable(),
          mediaType: z.enum(["image", "video", "text"]),
          caption: z.string().optional(),
          backgroundColor: z.string().optional(),
          textElements: z.string().optional(),
          stickerElements: z.string().optional(),
          locationData: z.string().optional(),
          professionBadge: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar se é profissional
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const professional = await db
          .select()
          .from(schema.professionals)
          .where(eq(schema.professionals.uid, ctx.user.openId))
          .limit(1);
        
        if (!professional.length) {
          throw new Error('Apenas profissionais podem criar stories');
        }
        
        return await createStory({
          professionalId: professional[0].id,
          ...input,
        });
      }),
    
    // Listar stories de um profissional
    getByProfessional: publicProcedure
      .input(z.object({ professionalId: z.number() }))
      .query(async ({ input }) => {
        return await getActiveStoriesByProfessional(input.professionalId);
      }),
    
    // Listar todos stories ativos (feed)
    getAll: publicProcedure.query(async () => {
      return await getAllActiveStories();
    }),
    
    // Marcar story como visualizado
    markViewed: protectedProcedure
      .input(z.object({ storyId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await markStoryAsViewed(input.storyId, ctx.user.id);
        return { success: true };
      }),
    
    // Verificar se profissional tem stories ativos
    hasActive: publicProcedure
      .input(z.object({ professionalId: z.number() }))
      .query(async ({ input }) => {
        return await hasActiveStories(input.professionalId);
      }),
    
    // Admin: Listar TODOS os stories (incluindo expirados)
    getAllAdmin: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem acessar');
        }
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const stories = await db
          .select({
            id: schema.stories.id,
            professionalId: schema.stories.professionalId,
            mediaUrl: schema.stories.mediaUrl,
            mediaType: schema.stories.mediaType,
            caption: schema.stories.caption,
            backgroundColor: schema.stories.backgroundColor,
            textElements: schema.stories.textElements,
            stickerElements: schema.stories.stickerElements,
            locationData: schema.stories.locationData,
            professionBadge: schema.stories.professionBadge,
            viewCount: schema.stories.viewCount,
            createdAt: schema.stories.createdAt,
            expiresAt: schema.stories.expiresAt,
            professionalName: schema.professionals.displayName,
            professionalPhoto: schema.professionals.photoUrl,
            professionalCategory: schema.professionals.category,
          })
          .from(schema.stories)
          .leftJoin(schema.professionals, eq(schema.stories.professionalId, schema.professionals.id))
          .orderBy(desc(schema.stories.createdAt));
        
        return stories as any;
      }),
    
    // Admin: Deletar story
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem deletar stories');
        }
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db
          .delete(schema.stories)
          .where(eq(schema.stories.id, input.id));
        
        return { success: true };
      }),
  }),
  
  // SEO Router
  seo: router({
    getSitemap: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const professionals = await db
          .select({
            id: schema.professionals.id,
            uid: schema.professionals.uid,
            updatedAt: schema.professionals.updatedAt,
          })
          .from(schema.professionals)
          .where(eq(schema.professionals.verificationStatus, 'approved'));
        
        const baseUrl = 'https://bokaboka-zwyrq4ic.manus.space';
        const currentDate = new Date().toISOString();
        
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Homepage
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/</loc>\n`;
        sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
        sitemap += '    <changefreq>daily</changefreq>\n';
        sitemap += '    <priority>1.0</priority>\n';
        sitemap += '  </url>\n';
        
        // Rankings
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/rankings</loc>\n`;
        sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
        sitemap += '    <changefreq>daily</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
        
        // Professional profiles
        for (const prof of professionals) {
          sitemap += '  <url>\n';
          sitemap += `    <loc>${baseUrl}/professional/${prof.uid}</loc>\n`;
          sitemap += `    <lastmod>${prof.updatedAt?.toISOString() || currentDate}</lastmod>\n`;
          sitemap += '    <changefreq>weekly</changefreq>\n';
          sitemap += '    <priority>0.7</priority>\n';
          sitemap += '  </url>\n';
        }
        
        sitemap += '</urlset>';
        
        return { sitemap };
      }),
  }),
  
  // Admin Settings
  adminSettings: router({
    // Obter configuração do balão
    getBubbleConfig: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem acessar');
        }
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const settings = await db
          .select()
          .from(schema.systemSettings)
          .where(eq(schema.systemSettings.settingKey, 'bubble_config'));
        
        if (settings.length === 0) {
          // Retornar valores padrão
          return {
            message: 'Novos profissionais cadastrados hoje!',
            number: 150,
            label: 'profissionais'
          };
        }
        
        return JSON.parse(settings[0].settingValue);
      }),
    
    // Salvar configuração do balão
    saveBubbleConfig: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          number: z.number(),
          label: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem salvar configurações');
        }
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const configValue = JSON.stringify(input);
        
        // Verificar se já existe
        const existing = await db
          .select()
          .from(schema.systemSettings)
          .where(eq(schema.systemSettings.settingKey, 'bubble_config'));
        
        if (existing.length > 0) {
          // Atualizar
          await db
            .update(schema.systemSettings)
            .set({
              settingValue: configValue,
              updatedBy: ctx.user.id,
            })
            .where(eq(schema.systemSettings.settingKey, 'bubble_config'));
        } else {
          // Criar
          await db
            .insert(schema.systemSettings)
            .values({
              settingKey: 'bubble_config',
              settingValue: configValue,
              description: 'Configuração do balão de estatísticas',
              updatedBy: ctx.user.id,
            });
        }
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

