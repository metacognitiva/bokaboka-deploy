import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

/**
 * Script para limpar dados simulados do banco de dados
 * Mantém apenas a estrutura das tabelas
 * 
 * Execute: npx tsx scripts/clean-database.ts
 */

async function cleanDatabase() {
  console.log('🧹 Iniciando limpeza do banco de dados...\n');

  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'bokaboka',
  });

  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    // 1. Limpar pageViews
    console.log('📊 Limpando visualizações de página...');
    await connection.execute('DELETE FROM pageViews');
    const [pageViewsResult]: any = await connection.execute('SELECT COUNT(*) as count FROM pageViews');
    console.log(`   ✅ ${pageViewsResult[0].count} registros restantes\n`);

    // 2. Limpar gamification
    console.log('🎮 Limpando gamificação...');
    await connection.execute('DELETE FROM gamification');
    const [gamificationResult]: any = await connection.execute('SELECT COUNT(*) as count FROM gamification');
    console.log(`   ✅ ${gamificationResult[0].count} registros restantes\n`);

    // 3. Limpar badges
    console.log('🏆 Limpando badges...');
    await connection.execute('DELETE FROM badges');
    const [badgesResult]: any = await connection.execute('SELECT COUNT(*) as count FROM badges');
    console.log(`   ✅ ${badgesResult[0].count} registros restantes\n`);

    // 4. Limpar reviews
    console.log('⭐ Limpando avaliações...');
    await connection.execute('DELETE FROM reviews');
    const [reviewsResult]: any = await connection.execute('SELECT COUNT(*) as count FROM reviews');
    console.log(`   ✅ ${reviewsResult[0].count} registros restantes\n`);

    // 5. Limpar reports
    console.log('🚨 Limpando denúncias...');
    await connection.execute('DELETE FROM reports');
    const [reportsResult]: any = await connection.execute('SELECT COUNT(*) as count FROM reports');
    console.log(`   ✅ ${reportsResult[0].count} registros restantes\n`);

    // 6. Limpar payments
    console.log('💰 Limpando pagamentos...');
    await connection.execute('DELETE FROM payments');
    const [paymentsResult]: any = await connection.execute('SELECT COUNT(*) as count FROM payments');
    console.log(`   ✅ ${paymentsResult[0].count} registros restantes\n`);

    // 7. Limpar professionals (TODOS os dados simulados)
    console.log('👨‍💼 Limpando profissionais...');
    const [profsBefore]: any = await connection.execute('SELECT COUNT(*) as count FROM professionals');
    console.log(`   📊 Profissionais antes: ${profsBefore[0].count}`);
    
    await connection.execute('DELETE FROM professionals');
    
    const [profsAfter]: any = await connection.execute('SELECT COUNT(*) as count FROM professionals');
    console.log(`   ✅ Profissionais depois: ${profsAfter[0].count}\n`);

    // 8. Limpar leads (se houver)
    console.log('📧 Limpando leads...');
    await connection.execute('DELETE FROM leads');
    const [leadsResult]: any = await connection.execute('SELECT COUNT(*) as count FROM leads');
    console.log(`   ✅ ${leadsResult[0].count} registros restantes\n`);

    // 9. MANTER users (usuários reais que fizeram login)
    const [usersResult]: any = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Usuários mantidos: ${usersResult[0].count} (usuários reais)\n`);

    console.log('═'.repeat(60));
    console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('═'.repeat(60));
    console.log('\n📋 Resumo:');
    console.log(`   • Profissionais: 0 (todos removidos)`);
    console.log(`   • Reviews: 0`);
    console.log(`   • Badges: 0`);
    console.log(`   • Gamification: 0`);
    console.log(`   • PageViews: 0`);
    console.log(`   • Reports: 0`);
    console.log(`   • Payments: 0`);
    console.log(`   • Leads: 0`);
    console.log(`   • Usuários: ${usersResult[0].count} (mantidos)`);
    console.log('\n🎯 O banco de dados está pronto para receber dados reais!\n');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Executar
cleanDatabase()
  .then(() => {
    console.log('🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });

