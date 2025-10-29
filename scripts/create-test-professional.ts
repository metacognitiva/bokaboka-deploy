import { getDb } from '../server/db';
import * as schema from '../drizzle/schema';

/**
 * Cria um profissional de teste para simular pagamentos
 */
async function createTestProfessional() {
  const db = await getDb();
  
  if (!db) {
    console.error('❌ Banco de dados não disponível');
    process.exit(1);
  }

  try {
    // Verificar se já existe
    const existing = await db
      .select()
      .from(schema.professionals)
      .where(schema.professionals.uid === 'test-professional')
      .limit(1);

    if (existing.length > 0) {
      console.log('✅ Profissional de teste já existe!');
      console.log('ID:', existing[0].id);
      console.log('UID:', existing[0].uid);
      console.log('Nome:', existing[0].displayName);
      return;
    }

    // Criar profissional de teste
    const result = await db.insert(schema.professionals).values({
      uid: 'test-professional',
      displayName: 'Profissional de Teste',
      category: 'Psicólogo',
      city: 'São Paulo, SP',
      phone: '(11) 99999-9999',
      whatsapp: '5511999999999',
      email: 'teste@bokaboka.com',
      bio: 'Este é um profissional de teste para simular pagamentos. Não é um perfil real.',
      planType: 'base',
      isActive: false,
      verified: false,
      cpf: '12345678901',
    });

    console.log('✅ Profissional de teste criado com sucesso!');
    console.log('ID:', result.insertId);
    console.log('UID: test-professional');
    console.log('\n📝 Use este ID para testar pagamentos em /test-payments');
    
  } catch (error) {
    console.error('❌ Erro ao criar profissional de teste:', error);
    process.exit(1);
  }

  process.exit(0);
}

createTestProfessional();

