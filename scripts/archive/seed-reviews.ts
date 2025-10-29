import { drizzle } from "drizzle-orm/mysql2";
import { professionals, reviews } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// Comentários realistas em português
const REVIEW_COMMENTS = [
  "Excelente profissional! Muito atencioso e pontual. Recomendo!",
  "Serviço impecável, superou minhas expectativas. Voltarei a contratar com certeza.",
  "Muito bom! Preço justo e trabalho de qualidade.",
  "Adorei o atendimento! Pessoa muito educada e prestativa.",
  "Profissional dedicado e competente. Fiquei muito satisfeito.",
  "Trabalho perfeito! Cumpriu todos os prazos combinados.",
  "Recomendo de olhos fechados! Melhor da região.",
  "Atendimento nota 10! Resolveu meu problema rapidamente.",
  "Muito profissional e caprichoso no que faz.",
  "Ótima experiência! Com certeza vou indicar para meus amigos.",
  "Serviço de primeira qualidade. Valeu cada centavo!",
  "Pessoa honesta e trabalhadora. Confiança total!",
  "Fiquei impressionado com a qualidade do trabalho.",
  "Pontual, educado e muito competente. Parabéns!",
  "Melhor profissional que já contratei nessa área.",
  "Trabalho limpo e bem feito. Recomendo muito!",
  "Atendimento rápido e eficiente. Adorei!",
  "Profissional sério e comprometido. Voltarei sempre!",
  "Fez um trabalho maravilhoso! Estou muito feliz com o resultado.",
  "Preço justo e qualidade excelente. Super recomendo!",
  "Muito atencioso e cuidadoso. Trabalho impecável!",
  "Resolveu tudo que precisava com muita competência.",
  "Gostei muito! Profissional de confiança.",
  "Trabalho bem feito e entregue no prazo. Perfeito!",
  "Educado, pontual e muito profissional. Nota 1000!",
  "Fiquei muito satisfeita! Trabalho de excelente qualidade.",
  "Recomendo! Pessoa séria e trabalho impecável.",
  "Melhor custo-benefício da região. Muito bom!",
  "Profissional competente e honesto. Confiança total!",
  "Adorei! Voltarei a contratar com certeza.",
];

const EMOJIS = ["😊", "👍", "⭐", "💯", "🙌", "👏", "❤️", "🎯", "✨", "🔥"];

async function main() {
  console.log("📝 Creating reviews with comments...");

  const allProfessionals = await db.select().from(professionals);

  let reviewCount = 0;

  for (const prof of allProfessionals) {
    // Each professional gets 3-15 reviews
    const numReviews = Math.floor(3 + Math.random() * 13);

    for (let i = 0; i < numReviews; i++) {
      const rating = Math.floor(3 + Math.random() * 3); // 3-5 stars
      const hasComment = Math.random() > 0.2; // 80% have comments
      const hasAudio = Math.random() > 0.85; // 15% have audio
      const hasEmoji = Math.random() > 0.7; // 30% have emoji

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90)); // Last 90 days

      await db.insert(reviews).values({
        professionalId: prof.id,
        rating: rating,
        comment: hasComment ? REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)] : null,
        audioUrl: hasAudio ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" : null,
        emoji: hasEmoji ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null,
        createdAt: createdAt,
      });

      reviewCount++;
    }
  }

  console.log(`✅ Created ${reviewCount} reviews for ${allProfessionals.length} professionals`);
  console.log(`📊 Average: ${(reviewCount / allProfessionals.length).toFixed(1)} reviews per professional`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });

