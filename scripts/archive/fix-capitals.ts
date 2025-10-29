import { drizzle } from "drizzle-orm/mysql2";
import { professionals } from "../drizzle/schema";
import { like, or } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

// TODAS AS 27 CAPITAIS BRASILEIRAS
const CAPITAIS = [
  { city: "Rio Branco", state: "AC", ddd: "68" },
  { city: "Maceió", state: "AL", ddd: "82" },
  { city: "Macapá", state: "AP", ddd: "96" },
  { city: "Manaus", state: "AM", ddd: "92" },
  { city: "Salvador", state: "BA", ddd: "71" },
  { city: "Fortaleza", state: "CE", ddd: "85" },
  { city: "Brasília", state: "DF", ddd: "61" },
  { city: "Vitória", state: "ES", ddd: "27" },
  { city: "Goiânia", state: "GO", ddd: "62" },
  { city: "São Luís", state: "MA", ddd: "98" },
  { city: "Cuiabá", state: "MT", ddd: "65" },
  { city: "Campo Grande", state: "MS", ddd: "67" },
  { city: "Belo Horizonte", state: "MG", ddd: "31" },
  { city: "Belém", state: "PA", ddd: "91" },
  { city: "João Pessoa", state: "PB", ddd: "83" },
  { city: "Curitiba", state: "PR", ddd: "41" },
  { city: "Recife", state: "PE", ddd: "81" },
  { city: "Teresina", state: "PI", ddd: "86" },
  { city: "Rio de Janeiro", state: "RJ", ddd: "21" },
  { city: "Natal", state: "RN", ddd: "84" },
  { city: "Porto Alegre", state: "RS", ddd: "51" },
  { city: "Porto Velho", state: "RO", ddd: "69" },
  { city: "Boa Vista", state: "RR", ddd: "95" },
  { city: "Florianópolis", state: "SC", ddd: "48" },
  { city: "São Paulo", state: "SP", ddd: "11" },
  { city: "Aracaju", state: "SE", ddd: "79" },
  { city: "Palmas", state: "TO", ddd: "63" },
];

const CATEGORIES = [
  "Psicólogo", "Pintor", "Eletricista", "Encanador", "Designer Gráfico",
  "Fotógrafo", "Personal Trainer", "Professor Particular", "Jardineiro", "Mecânico"
];

const FIRST_NAMES = ["Ana", "João", "Maria", "Pedro", "Carla", "Lucas", "Juliana", "Rafael", "Beatriz", "Gabriel"];
const LAST_NAMES = ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Ferreira", "Rodrigues", "Alves", "Pereira", "Lima"];

const BIOS = [
  "Profissional experiente com mais de 10 anos de mercado. Atendimento personalizado e qualidade garantida.",
  "Especialista dedicado em oferecer o melhor serviço. Satisfação do cliente é minha prioridade.",
  "Trabalho com excelência e compromisso. Resultados que superam expectativas.",
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
  console.log("🏛️  Verificando e adicionando profissionais em TODAS as 27 capitais...");

  for (const capital of CAPITAIS) {
    const cityPattern = `${capital.city} - ${capital.state}`;
    
    // Check if capital already has professionals
    const existing = await db
      .select()
      .from(professionals)
      .where(like(professionals.city, `%${capital.city}%`))
      .limit(1);

    if (existing.length > 0) {
      console.log(`✅ ${capital.city} - ${capital.state} já tem profissionais`);
      continue;
    }

    console.log(`➕ Adicionando profissionais em ${capital.city} - ${capital.state}...`);

    // Add 10 professionals per capital
    for (let i = 0; i < 10; i++) {
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

    console.log(`✅ ${capital.city} - ${capital.state} agora tem profissionais!`);
  }

  console.log("\n🎉 Todas as 27 capitais agora têm profissionais cadastrados!");
}

main()
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });

