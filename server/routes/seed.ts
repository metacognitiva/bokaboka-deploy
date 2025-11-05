import { Express } from "express";
import { db } from "../db";
import { categories, professionals, reviews } from "../../drizzle/schema-pg";

export function registerSeedRoute(app: Express) {
  app.get("/api/admin/seed", async (req, res) => {
    try {
      // Limpar dados existentes
      await db.delete(reviews);
      await db.delete(professionals);
      await db.delete(categories);

      // Criar categorias
      const categoriesData = [
        { name: "Psicologia", slug: "psicologia", icon: "🧠" },
        { name: "Odontologia", slug: "odontologia", icon: "🦷" },
        { name: "Pintura", slug: "pintura", icon: "🎨" },
        { name: "Eletricista", slug: "eletricista", icon: "⚡" },
        { name: "Encanador", slug: "encanador", icon: "🔧" },
        { name: "Jardinagem", slug: "jardinagem", icon: "🌱" },
        { name: "Limpeza", slug: "limpeza", icon: "🧹" },
        { name: "Marcenaria", slug: "marcenaria", icon: "🪚" },
      ];

      await db.insert(categories).values(categoriesData);

      // Criar profissionais
      const professionalsData = [
        {
          displayName: "Dra. Ana Paula Silva",
          category: "Psicologia",
          city: "São Paulo",
          state: "SP",
          bio: "Psicóloga clínica com 15 anos de experiência em terapia cognitivo-comportamental.",
          phone: "(11) 98765-4321",
          whatsapp: "5511987654321",
          email: "ana.silva@psi.com.br",
          photoUrl: "https://i.pravatar.cc/300?img=1",
          rating: 4.9,
          reviewCount: 45,
          latitude: -23.5505,
          longitude: -46.6333,
        },
        {
          displayName: "Dr. Carlos Mendes",
          category: "Odontologia",
          city: "São Paulo",
          state: "SP",
          bio: "Dentista especializado em implantes e estética dental.",
          phone: "(11) 97654-3210",
          whatsapp: "5511976543210",
          email: "carlos.mendes@odonto.com.br",
          photoUrl: "https://i.pravatar.cc/300?img=12",
          rating: 4.8,
          reviewCount: 38,
          latitude: -23.5505,
          longitude: -46.6333,
        },
        {
          displayName: "João Pereira",
          category: "Pintura",
          city: "Rio de Janeiro",
          state: "RJ",
          bio: "Pintor residencial e comercial com 10 anos de experiência.",
          phone: "(21) 98888-7777",
          whatsapp: "5521988887777",
          photoUrl: "https://i.pravatar.cc/300?img=33",
          rating: 4.7,
          reviewCount: 52,
          latitude: -22.9068,
          longitude: -43.1729,
        },
        {
          displayName: "Ricardo Santos",
          category: "Eletricista",
          city: "São Paulo",
          state: "SP",
          bio: "Eletricista certificado, atendimento 24h para emergências.",
          phone: "(11) 99999-8888",
          whatsapp: "5511999998888",
          photoUrl: "https://i.pravatar.cc/300?img=14",
          rating: 4.9,
          reviewCount: 67,
          latitude: -23.5505,
          longitude: -46.6333,
        },
        {
          displayName: "Marcos Oliveira",
          category: "Encanador",
          city: "Belo Horizonte",
          state: "MG",
          bio: "Encanador profissional, especialista em vazamentos e instalações.",
          phone: "(31) 97777-6666",
          whatsapp: "5531977776666",
          photoUrl: "https://i.pravatar.cc/300?img=15",
          rating: 4.6,
          reviewCount: 41,
          latitude: -19.9167,
          longitude: -43.9345,
        },
        {
          displayName: "Fernanda Costa",
          category: "Jardinagem",
          city: "São Paulo",
          state: "SP",
          bio: "Paisagista e jardineira, criando espaços verdes incríveis.",
          phone: "(11) 96666-5555",
          whatsapp: "5511966665555",
          photoUrl: "https://i.pravatar.cc/300?img=5",
          rating: 4.8,
          reviewCount: 33,
          latitude: -23.5505,
          longitude: -46.6333,
        },
        {
          displayName: "Limpeza Total - Maria Silva",
          category: "Limpeza",
          city: "Rio de Janeiro",
          state: "RJ",
          bio: "Serviços de limpeza residencial e pós-obra com equipe treinada.",
          phone: "(21) 95555-4444",
          whatsapp: "5521955554444",
          photoUrl: "https://i.pravatar.cc/300?img=9",
          rating: 4.9,
          reviewCount: 78,
          latitude: -22.9068,
          longitude: -43.1729,
        },
        {
          displayName: "Paulo Marcenaria",
          category: "Marcenaria",
          city: "Curitiba",
          state: "PR",
          bio: "Marceneiro artesanal, móveis planejados sob medida.",
          phone: "(41) 94444-3333",
          whatsapp: "5541944443333",
          photoUrl: "https://i.pravatar.cc/300?img=11",
          rating: 4.7,
          reviewCount: 29,
          latitude: -25.4284,
          longitude: -49.2733,
        },
        {
          displayName: "Dra. Beatriz Almeida",
          category: "Psicologia",
          city: "São Paulo",
          state: "SP",
          bio: "Psicóloga especializada em terapia familiar e de casal.",
          phone: "(11) 93333-2222",
          whatsapp: "5511933332222",
          email: "beatriz.almeida@psi.com.br",
          photoUrl: "https://i.pravatar.cc/300?img=10",
          rating: 4.9,
          reviewCount: 56,
          latitude: -23.5505,
          longitude: -46.6333,
        },
        {
          displayName: "Dr. Roberto Lima",
          category: "Odontologia",
          city: "Fortaleza",
          state: "CE",
          bio: "Cirurgião-dentista com especialização em ortodontia.",
          phone: "(85) 92222-1111",
          whatsapp: "5585922221111",
          email: "roberto.lima@odonto.com.br",
          photoUrl: "https://i.pravatar.cc/300?img=13",
          rating: 4.8,
          reviewCount: 44,
          latitude: -3.7172,
          longitude: -38.5433,
        },
      ];

      const insertedProfessionals = await db
        .insert(professionals)
        .values(professionalsData)
        .returning();

      // Criar avaliações
      const reviewsData = [
        {
          professionalId: insertedProfessionals[0].id,
          rating: 5,
          comment: "Excelente profissional! Me ajudou muito com minha ansiedade. 🙏",
          reviewerName: "Maria Santos",
        },
        {
          professionalId: insertedProfessionals[0].id,
          rating: 5,
          comment: "Muito atenciosa e competente. Recomendo! ⭐",
          reviewerName: "João Silva",
        },
        {
          professionalId: insertedProfessionals[1].id,
          rating: 5,
          comment: "Melhor dentista que já fui! Trabalho impecável. 😁",
          reviewerName: "Ana Costa",
        },
        {
          professionalId: insertedProfessionals[2].id,
          rating: 5,
          comment: "Pintou minha casa toda, ficou perfeito! 🎨",
          reviewerName: "Carlos Mendes",
        },
        {
          professionalId: insertedProfessionals[3].id,
          rating: 5,
          comment: "Resolveu meu problema elétrico rapidamente. Top! ⚡",
          reviewerName: "Paula Oliveira",
        },
        {
          professionalId: insertedProfessionals[4].id,
          rating: 4,
          comment: "Bom trabalho, mas demorou um pouco mais que o esperado.",
          reviewerName: "Ricardo Santos",
        },
        {
          professionalId: insertedProfessionals[5].id,
          rating: 5,
          comment: "Meu jardim ficou lindo! Muito criativa. 🌺",
          reviewerName: "Fernanda Lima",
        },
        {
          professionalId: insertedProfessionals[6].id,
          rating: 5,
          comment: "Equipe super profissional, limpeza impecável! 🧹",
          reviewerName: "Marcos Almeida",
        },
        {
          professionalId: insertedProfessionals[7].id,
          rating: 5,
          comment: "Móveis lindos e bem feitos. Vale cada centavo! 🪚",
          reviewerName: "Beatriz Costa",
        },
        {
          professionalId: insertedProfessionals[8].id,
          rating: 5,
          comment: "Salvou meu casamento! Profissional incrível. ❤️",
          reviewerName: "Roberto Silva",
        },
        {
          professionalId: insertedProfessionals[9].id,
          rating: 5,
          comment: "Aparelho ortodôntico perfeito, sem dor! 😊",
          reviewerName: "Juliana Mendes",
        },
      ];

      await db.insert(reviews).values(reviewsData);

      res.json({
        success: true,
        message: "Seed executado com sucesso!",
        data: {
          categories: categoriesData.length,
          professionals: insertedProfessionals.length,
          reviews: reviewsData.length,
        },
      });
    } catch (error) {
      console.error("Erro ao executar seed:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  });
}
