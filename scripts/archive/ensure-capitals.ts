import { drizzle } from "drizzle-orm/mysql2";
import { professionals } from "../drizzle/schema";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

const REQUIRED_CAPITALS = [
  { city: "Natal", state: "RN", ddd: "84" },
  { city: "Aracaju", state: "SE", ddd: "79" },
  { city: "Maceió", state: "AL", ddd: "82" },
  { city: "Salvador", state: "BA", ddd: "71" },
  { city: "São Paulo", state: "SP", ddd: "11" },
  { city: "Belo Horizonte", state: "MG", ddd: "31" },
  { city: "Vitória", state: "ES", ddd: "27" },
  { city: "Goiânia", state: "GO", ddd: "62" },
  { city: "Brasília", state: "DF", ddd: "61" },
  { city: "Palmas", state: "TO", ddd: "63" },
  { city: "Belém", state: "PA", ddd: "91" },
];

const CATEGORIES = [
  "Psicólogo", "Pintor", "Eletricista", "Encanador", "Designer Gráfico",
  "Fotógrafo", "Personal Trainer", "Professor Particular", "Jardineiro", "Mecânico",
  "Advogado", "Contador", "Arquiteto", "Engenheiro Civil", "Desenvolvedor Web",
  "Pedreiro", "Marceneiro", "Diarista", "Cozinheiro", "Manicure"
];

const FIRST_NAMES = ["Ana", "João", "Maria", "Pedro", "Carla", "Lucas", "Juliana", "Rafael", "Beatriz", "Gabriel", "Fernanda", "Bruno", "Camila", "Diego", "Larissa"];
const LAST_NAMES = ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Ferreira", "Rodrigues", "Alves", "Pereira", "Lima", "Gomes", "Martins", "Araújo", "Ribeiro", "Carvalho"];

const BIOS = [
  "Profissional experiente com mais de 10 anos de mercado. Atendimento personalizado e qualidade garantida.",
  "Especialista dedicado em oferecer o melhor serviço. Satisfação do cliente é minha prioridade.",
  "Trabalho com excelência e compromisso. Resultados que superam expectativas.",
  "Atendimento de qualidade com preços justos. Sua satisfação é minha meta!",
  "Anos de experiência e clientes satisfeitos. Faça um orçamento sem compromisso.",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function randomPhone(ddd: string): string {
  return `(${ddd}) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function main() {
  console.log("🏛️  Verificando capitais obrigatórias...\n");

  for (const capital of REQUIRED_CAPITALS) {
    const cityPattern = `${capital.city} - ${capital.state}`;
    
    // Check existing professionals
    const existing = await db.select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(sql`city = ${cityPattern}`);
    
    const count = Number(existing[0].count);
    console.log(`📍 ${cityPattern}: ${count} profissionais existentes`);
    
    // Add at least 10 professionals per capital
    const toAdd = Math.max(0, 10 - count);
    
    if (toAdd > 0) {
      console.log(`   ➕ Adicionando ${toAdd} profissionais...`);
      
      for (let i = 0; i < toAdd; i++) {
        const name = `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
        const phone = randomPhone(capital.ddd);
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + Math.floor(1 + Math.random() * 7));

        const galleryPhotos = [];
        for (let j = 0; j < Math.floor(2 + Math.random() * 4); j++) {
          galleryPhotos.push(`https://picsum.photos/800/600?random=${Date.now()}-${i}-${j}`);
        }

        await db.insert(professionals).values({
          uid: uid(),
          displayName: name,
          category: rand(CATEGORIES),
          city: cityPattern,
          phone: phone,
          whatsapp: phone,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
          bio: rand(BIOS),
          photoUrl: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70) + 1}`,
          galleryPhotos: JSON.stringify(galleryPhotos),
          instagramVideoUrl: i % 4 === 0 ? "https://www.instagram.com/reel/example/" : null,
          instagramHandle: i % 3 === 0 ? `@${name.toLowerCase().replace(/\s+/g, "_")}` : null,
          stars: Math.floor(35 + Math.random() * 15),
          reviewCount: Math.floor(5 + Math.random() * 95),
          badge: i % 3 === 0 ? "verified" : i % 5 === 0 ? "trusted" : "none",
          planType: i % 5 === 0 ? "destaque" : "base",
          trialEndsAt: trialEndsAt,
          subscriptionEndsAt: null,
          isActive: true,
        });
      }
    }
  }

  console.log("\n✅ Todas as capitais obrigatórias verificadas!");
}

main()
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });

