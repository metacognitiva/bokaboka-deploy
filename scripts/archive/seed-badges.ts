import { drizzle } from 'drizzle-orm/mysql2';
import { badges } from '../drizzle/schema';

const db = drizzle(process.env.DATABASE_URL!);

const badgesList = [
  // Services milestones
  { name: "Primeiro Serviço", description: "Completou seu primeiro serviço", icon: "🎯", requirement: 1, type: "services" as const },
  { name: "10 Serviços", description: "Completou 10 serviços", icon: "⭐", requirement: 10, type: "services" as const },
  { name: "50 Serviços", description: "Completou 50 serviços", icon: "🏆", requirement: 50, type: "services" as const },
  { name: "100 Serviços", description: "Completou 100 serviços", icon: "👑", requirement: 100, type: "services" as const },
  { name: "500 Serviços", description: "Completou 500 serviços - Profissional Lendário!", icon: "💎", requirement: 500, type: "services" as const },
  
  // Rating milestones
  { name: "4 Estrelas", description: "Mantém avaliação média de 4 estrelas", icon: "⭐", requirement: 40, type: "rating" as const },
  { name: "4.5 Estrelas", description: "Mantém avaliação média de 4.5 estrelas", icon: "🌟", requirement: 45, type: "rating" as const },
  { name: "5 Estrelas Perfeito", description: "Mantém avaliação perfeita de 5 estrelas", icon: "✨", requirement: 50, type: "rating" as const },
  
  // Reviews milestones
  { name: "Primeira Avaliação", description: "Recebeu sua primeira avaliação", icon: "💬", requirement: 1, type: "reviews" as const },
  { name: "10 Avaliações", description: "Recebeu 10 avaliações", icon: "📝", requirement: 10, type: "reviews" as const },
  { name: "50 Avaliações", description: "Recebeu 50 avaliações", icon: "📋", requirement: 50, type: "reviews" as const },
  { name: "100 Avaliações", description: "Recebeu 100 avaliações", icon: "📚", requirement: 100, type: "reviews" as const },
  
  // Referral milestones
  { name: "Primeiro Indicado", description: "Indicou seu primeiro profissional", icon: "🤝", requirement: 1, type: "referrals" as const },
  { name: "5 Indicações", description: "Indicou 5 profissionais", icon: "🎁", requirement: 5, type: "referrals" as const },
  { name: "Embaixador", description: "Indicou 10 ou mais profissionais", icon: "👥", requirement: 10, type: "referrals" as const },
];

async function main() {
  console.log("🏅 Creating gamification badges...");
  
  for (const badge of badgesList) {
    await db.insert(badges).values(badge).onDuplicateKeyUpdate({
      set: { description: badge.description, icon: badge.icon, requirement: badge.requirement }
    });
  }
  
  console.log(`✅ Created ${badgesList.length} badges`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });

