import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema-pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:dNwRCzxWFFSRHQbNEKIrUQtOnz1gBfogwbokaboka-db.railway.internal:5432/railway';

const sql = postgres(DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar categorias
    console.log('📁 Criando categorias...');
    const categories = await db.insert(schema.categories).values([
      { name: 'Psicologia', icon: '🧠', displayOrder: 1, isActive: true },
      { name: 'Odontologia', icon: '🦷', displayOrder: 2, isActive: true },
      { name: 'Pintura', icon: '🎨', displayOrder: 3, isActive: true },
      { name: 'Eletricista', icon: '⚡', displayOrder: 4, isActive: true },
      { name: 'Encanador', icon: '🔧', displayOrder: 5, isActive: true },
      { name: 'Jardinagem', icon: '🌿', displayOrder: 6, isActive: true },
      { name: 'Limpeza', icon: '🧹', displayOrder: 7, isActive: true },
      { name: 'Marcenaria', icon: '🪚', displayOrder: 8, isActive: true },
    ]).returning();
    console.log(`✅ ${categories.length} categorias criadas`);

    // Criar profissionais
    console.log('👥 Criando profissionais...');
    const professionals = await db.insert(schema.professionals).values([
      {
        uid: 'prof-001',
        displayName: 'Dra. Ana Paula Silva',
        category: 'Psicologia',
        city: 'São Paulo',
        latitude: '-23.5505',
        longitude: '-46.6333',
        phone: '(11) 98765-4321',
        whatsapp: '5511987654321',
        email: 'ana.silva@email.com',
        bio: 'Psicóloga clínica com 10 anos de experiência em terapia cognitivo-comportamental. Especialista em ansiedade e depressão.',
        photoUrl: 'https://i.pravatar.cc/300?img=1',
        stars: 49, // 4.9 stars (stored as 0-50)
        reviewCount: 127,
        badge: 'verified',
        planType: 'destaque',
        verificationStatus: 'approved',
        isActive: true,
      },
      {
        uid: 'prof-002',
        displayName: 'Dr. Carlos Mendes',
        category: 'Odontologia',
        city: 'São Paulo',
        latitude: '-23.5505',
        longitude: '-46.6333',
        phone: '(11) 97654-3210',
        whatsapp: '5511976543210',
        email: 'carlos.mendes@email.com',
        bio: 'Cirurgião-dentista com especialização em implantes e estética dental. Atendimento humanizado e tecnologia de ponta.',
        photoUrl: 'https://i.pravatar.cc/300?img=12',
        stars: 48, // 4.8 stars
        reviewCount: 89,
        badge: 'verified',
        planType: 'destaque',
        verificationStatus: 'approved',
        isActive: true,
      },
      {
        uid: 'prof-003',
        displayName: 'João Pereira',
        category: 'Pintura',
        city: 'Rio de Janeiro',
        latitude: '-22.9068',
        longitude: '-43.1729',
        phone: '(21) 99876-5432',
        whatsapp: '5521998765432',
        email: 'joao.pereira@email.com',
        bio: 'Pintor profissional com 15 anos de experiência. Especialista em pintura residencial e comercial.',
        photoUrl: 'https://i.pravatar.cc/300?img=33',
        stars: 47, // 4.7 stars
        reviewCount: 156,
        badge: 'verified',
        planType: 'base',
        verificationStatus: 'approved',
        isActive: true,
      },
      {
        uid: 'prof-004',
        displayName: 'Ricardo Santos',
        category: 'Eletricista',
        city: 'São Paulo',
        latitude: '-23.5505',
        longitude: '-46.6333',
        phone: '(11) 96543-2109',
        whatsapp: '5511965432109',
        email: 'ricardo.santos@email.com',
        bio: 'Eletricista certificado com experiência em instalações residenciais e comerciais. Atendimento 24h para emergências.',
        photoUrl: 'https://i.pravatar.cc/300?img=14',
        stars: 49, // 4.9 stars
        reviewCount: 203,
        badge: 'trusted',
        planType: 'destaque',
        verificationStatus: 'approved',
        isActive: true,
      },
      {
        uid: 'prof-005',
        displayName: 'Marcos Oliveira',
        category: 'Encanador',
        city: 'Belo Horizonte',
        latitude: '-19.9167',
        longitude: '-43.9345',
        phone: '(31) 98765-1234',
        whatsapp: '5531987651234',
        email: 'marcos.oliveira@email.com',
        bio: 'Encanador profissional com 12 anos de experiência. Especialista em vazamentos e instalações hidráulicas.',
        photoUrl: 'https://i.pravatar.cc/300?img=15',
        stars: 46, // 4.6 stars
        reviewCount: 98,
        badge: 'verified',
        planType: 'base',
        verificationStatus: 'approved',
        isActive: true,
      },
      {
        uid: 'prof-006',
        displayName: 'Fernanda Costa',
        category: 'Jardinagem',
        city: 'São Paulo',
        latitude: '-23.5505',
        longitude: '-46.6333',
        phone: '(11) 95432-1098',
        whatsapp: '5511954321098',
        email: 'fernanda.costa@email.com',
        bio: 'Paisagista e jardineira com paixão por criar espaços verdes harmoniosos. Especialista em jardins residenciais.',
        photoUrl: 'https://i.pravatar.cc/300?img=5',
        stars: 48, // 4.8 stars
        reviewCount: 74,
        badge: 'verified',
        planType: 'base',
        verificationStatus: 'approved',
        isActive: true,
      },
      {
        uid: 'prof-007',
        displayName: 'Limpeza Total - Maria Silva',
        category: 'Limpeza',
        city: 'Rio de Janeiro',
        latitude: '-22.9068',
        longitude: '-43.1729',
        phone: '(21) 97654-3210',
        whatsapp: '5521976543210',
        email: 'maria.silva@email.com',
        bio: 'Serviços de limpeza residencial e comercial com equipe treinada. Produtos ecológicos e equipamentos modernos.',
        photoUrl: 'https://i.pravatar.cc/300?img=9',
        stars: 49, // 4.9 stars
        reviewCount: 312,
        badge: 'trusted',
        planType: 'destaque',
        verificationStatus: 'approved',
        isActive: true,
      },
      {
        uid: 'prof-008',
        displayName: 'Paulo Marcenaria',
        category: 'Marcenaria',
        city: 'Curitiba',
        latitude: '-25.4284',
        longitude: '-49.2733',
        phone: '(41) 98765-4321',
        whatsapp: '5541987654321',
        email: 'paulo.marcenaria@email.com',
        bio: 'Marceneiro artesanal com 20 anos de experiência. Móveis planejados e restauração de peças antigas.',
        photoUrl: 'https://i.pravatar.cc/300?img=51',
        stars: 47, // 4.7 stars
        reviewCount: 67,
        badge: 'verified',
        planType: 'base',
        verificationStatus: 'approved',
        isActive: true,
      },
      {
        uid: 'prof-009',
        displayName: 'Dra. Beatriz Almeida',
        category: 'Psicologia',
        city: 'São Paulo',
        latitude: '-23.5505',
        longitude: '-46.6333',
        phone: '(11) 94321-0987',
        whatsapp: '5511943210987',
        email: 'beatriz.almeida@email.com',
        bio: 'Psicóloga especializada em terapia familiar e de casal. Abordagem sistêmica e humanista.',
        photoUrl: 'https://i.pravatar.cc/300?img=10',
        stars: 48, // 4.8 stars
        reviewCount: 145,
        badge: 'verified',
        planType: 'base',
        verificationStatus: 'approved',
        isActive: true,
      },
      {
        uid: 'prof-010',
        displayName: 'Dr. Roberto Lima',
        category: 'Odontologia',
        city: 'Fortaleza',
        latitude: '-3.7172',
        longitude: '-38.5433',
        phone: '(85) 99876-5432',
        whatsapp: '5585998765432',
        email: 'roberto.lima@email.com',
        bio: 'Dentista com foco em odontopediatria. Atendimento lúdico e acolhedor para crianças.',
        photoUrl: 'https://i.pravatar.cc/300?img=13',
        stars: 49, // 4.9 stars
        reviewCount: 178,
        badge: 'trusted',
        planType: 'destaque',
        verificationStatus: 'approved',
        isActive: true,
      },
    ]).returning();
    console.log(`✅ ${professionals.length} profissionais criados`);

    // Criar avaliações
    console.log('⭐ Criando avaliações...');
    const reviews = [];
    
    // Reviews para Dra. Ana Paula Silva
    reviews.push(
      {
        professionalId: professionals[0].id,
        rating: 5,
        weight: 2,
        comment: 'Excelente profissional! Me ajudou muito a superar minha ansiedade. Recomendo!',
        emoji: '😊',
        isVerified: true,
      },
      {
        professionalId: professionals[0].id,
        rating: 5,
        weight: 1,
        comment: 'Muito atenciosa e competente. Ambiente acolhedor.',
        emoji: '👍',
        isVerified: false,
      },
      {
        professionalId: professionals[0].id,
        rating: 4,
        weight: 1,
        comment: 'Ótima terapeuta, só achei um pouco caro.',
        emoji: '😐',
        isVerified: false,
      }
    );

    // Reviews para Dr. Carlos Mendes
    reviews.push(
      {
        professionalId: professionals[1].id,
        rating: 5,
        weight: 2,
        comment: 'Melhor dentista que já consultei! Trabalho impecável.',
        emoji: '🦷',
        isVerified: true,
      },
      {
        professionalId: professionals[1].id,
        rating: 5,
        weight: 2,
        comment: 'Implante perfeito, sem dor. Muito profissional!',
        emoji: '⭐',
        isVerified: true,
      }
    );

    // Reviews para João Pereira
    reviews.push(
      {
        professionalId: professionals[2].id,
        rating: 5,
        weight: 2,
        comment: 'Pintou minha casa toda em 3 dias. Trabalho limpo e bem feito!',
        emoji: '🎨',
        isVerified: true,
      },
      {
        professionalId: professionals[2].id,
        rating: 4,
        weight: 1,
        comment: 'Bom trabalho, mas atrasou um dia.',
        emoji: '👌',
        isVerified: false,
      }
    );

    // Reviews para Ricardo Santos
    reviews.push(
      {
        professionalId: professionals[3].id,
        rating: 5,
        weight: 2,
        comment: 'Resolveu meu problema elétrico rapidamente. Muito profissional!',
        emoji: '⚡',
        isVerified: true,
      },
      {
        professionalId: professionals[3].id,
        rating: 5,
        weight: 2,
        comment: 'Atendimento 24h salvou minha vida! Recomendo muito.',
        emoji: '🙏',
        isVerified: true,
      }
    );

    // Reviews para Limpeza Total
    reviews.push(
      {
        professionalId: professionals[6].id,
        rating: 5,
        weight: 2,
        comment: 'Equipe super profissional! Deixaram minha casa brilhando.',
        emoji: '✨',
        isVerified: true,
      },
      {
        professionalId: professionals[6].id,
        rating: 5,
        weight: 2,
        comment: 'Melhor serviço de limpeza que já contratei. Pontualidade e qualidade!',
        emoji: '🧹',
        isVerified: true,
      }
    );

    await db.insert(schema.reviews).values(reviews);
    console.log(`✅ ${reviews.length} avaliações criadas`);

    console.log('🎉 Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seed();
