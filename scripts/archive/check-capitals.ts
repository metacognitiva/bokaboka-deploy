import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

const capitals = [
  'Rio Branco-AC', 'Maceió-AL', 'Macapá-AP', 'Manaus-AM', 'Salvador-BA',
  'Fortaleza-CE', 'Brasília-DF', 'Vitória-ES', 'Goiânia-GO', 'São Luís-MA',
  'Cuiabá-MT', 'Campo Grande-MS', 'Belo Horizonte-MG', 'Belém-PA', 'João Pessoa-PB',
  'Curitiba-PR', 'Recife-PE', 'Teresina-PI', 'Rio de Janeiro-RJ', 'Natal-RN',
  'Porto Alegre-RS', 'Porto Velho-RO', 'Boa Vista-RR', 'Florianópolis-SC',
  'São Paulo-SP', 'Aracaju-SE', 'Palmas-TO'
];

async function checkCapitals() {
  console.log('Verificando capitais no banco de dados...\n');
  
  let missing = 0;
  let present = 0;
  
  for (const capital of capitals) {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM professionals 
      WHERE city = ${capital}
    `);
    
    const count = (result[0] as any)[0].count;
    if (count > 0) {
      console.log(`✅ ${capital}: ${count} profissionais`);
      present++;
    } else {
      console.log(`❌ ${capital}: 0 profissionais`);
      missing++;
    }
  }
  
  console.log(`\n📊 Resumo: ${present}/27 capitais com profissionais, ${missing} faltando`);
}

checkCapitals().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});

