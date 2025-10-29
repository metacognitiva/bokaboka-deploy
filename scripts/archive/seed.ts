import { drizzle } from "drizzle-orm/mysql2";
import { professionals, categories } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const CITIES = ["Natal", "Parnamirim", "Mossoró", "Caicó", "João Pessoa", "São Paulo", "Rio de Janeiro", "Recife"];
const CATEGORIES_DATA = [
  { name: "Psicólogo", icon: "🧠" },
  { name: "Pintor", icon: "🎨" },
  { name: "Eletricista", icon: "⚡" },
  { name: "Encanador", icon: "🔧" },
  { name: "Designer", icon: "✨" },
  { name: "Fotógrafo", icon: "📸" },
  { name: "Personal Trainer", icon: "💪" },
  { name: "Professor Particular", icon: "📚" },
  { name: "Jardineiro", icon: "🌱" },
  { name: "Mecânico", icon: "🔩" },
];

const NAMES = [
  "Ana Silva", "João Santos", "Maria Oliveira", "Pedro Costa", "Carla Souza",
  "Lucas Ferreira", "Juliana Lima", "Rafael Alves", "Beatriz Rocha", "Gabriel Martins",
  "Fernanda Ribeiro", "Thiago Pereira", "Amanda Carvalho", "Bruno Araújo", "Camila Dias",
  "Diego Fernandes", "Larissa Gomes", "Matheus Barbosa", "Patrícia Monteiro", "Rodrigo Castro"
];

const BIOS = [
  "Profissional experiente com mais de 10 anos de mercado. Atendimento personalizado e qualidade garantida.",
  "Especialista dedicado em oferecer o melhor serviço. Satisfação do cliente é minha prioridade.",
  "Trabalho com excelência e compromisso. Resultados que superam expectativas.",
  "Atendimento humanizado e profissional. Sua confiança é meu maior patrimônio.",
  "Qualidade, pontualidade e preço justo. Faça seu orçamento sem compromisso.",
];

const INSTAGRAM_HANDLES = [
  "@profissional_confiavel", "@servicos_premium", "@expert_local", "@pro_qualidade", "@mestre_servicos"
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function randomPhone(): string {
  return `(84) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function main() {
  console.log("🌱 Starting seed...");

  // Insert categories
  console.log("📂 Creating categories...");
  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    await db.insert(categories).values({
      name: CATEGORIES_DATA[i].name,
      icon: CATEGORIES_DATA[i].icon,
      displayOrder: i,
    });
  }
  console.log(`✅ Created ${CATEGORIES_DATA.length} categories`);

  // Insert professionals
  console.log("👥 Creating professionals...");
  for (let i = 0; i < 20; i++) {
    const trialEndsAt = new Date();
    
    // Set different trial periods for testing
    if (i < 10) {
      // First 10: trial still valid (3-7 days remaining)
      trialEndsAt.setDate(trialEndsAt.getDate() + Math.floor(3 + Math.random() * 5));
    } else if (i < 15) {
      // Next 5: trial expired (1-3 days ago)
      trialEndsAt.setDate(trialEndsAt.getDate() - Math.floor(1 + Math.random() * 3));
    } else {
      // Last 5: trial expired but have subscription
      trialEndsAt.setDate(trialEndsAt.getDate() - 10);
    }

    const subscriptionEndsAt = i >= 15 ? (() => {
      const subDate = new Date();
      subDate.setDate(subDate.getDate() + 30); // 30 days subscription
      return subDate;
    })() : null;

    const category = rand(CATEGORIES_DATA);
    const phone = randomPhone();
    
    await db.insert(professionals).values({
      uid: uid(),
      displayName: NAMES[i],
      category: category.name,
      city: rand(CITIES),
      phone: phone,
      whatsapp: phone,
      email: `${NAMES[i].toLowerCase().replace(" ", ".")}@email.com`,
      bio: rand(BIOS),
      photoUrl: `https://i.pravatar.cc/300?img=${i + 1}`,
      instagramVideoUrl: i % 3 === 0 ? "https://www.instagram.com/reel/example/" : null,
      instagramHandle: i % 2 === 0 ? rand(INSTAGRAM_HANDLES) : null,
      stars: Math.floor(35 + Math.random() * 15), // 3.5 to 5.0 stars (stored as 35-50)
      reviewCount: Math.floor(5 + Math.random() * 50),
      badge: i % 3 === 0 ? "verified" : i % 5 === 0 ? "trusted" : "none",
      planType: i % 4 === 0 ? "destaque" : "base",
      trialEndsAt: trialEndsAt,
      subscriptionEndsAt: subscriptionEndsAt,
      isActive: true,
    });
  }
  console.log("✅ Created 20 professionals");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });

