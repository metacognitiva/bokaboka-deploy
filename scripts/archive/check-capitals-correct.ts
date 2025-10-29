import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

const capitals = [
  { city: 'Rio Branco', state: 'AC' },
  { city: 'Maceió', state: 'AL' },
  { city: 'Macapá', state: 'AP' },
  { city: 'Manaus', state: 'AM' },
  { city: 'Salvador', state: 'BA' },
  { city: 'Fortaleza', state: 'CE' },
  { city: 'Brasília', state: 'DF' },
  { city: 'Vitória', state: 'ES' },
  { city: 'Goiânia', state: 'GO' },
  { city: 'São Luís', state: 'MA' },
  { city: 'Cuiabá', state: 'MT' },
  { city: 'Campo Grande', state: 'MS' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Belém', state: 'PA' },
  { city: 'João Pessoa', state: 'PB' },
  { city: 'Curitiba', state: 'PR' },
  { city: 'Recife', state: 'PE' },
  { city: 'Teresina', state: 'PI' },
  { city: 'Rio de Janeiro', state: 'RJ' },
  { city: 'Natal', state: 'RN' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Porto Velho', state: 'RO' },
  { city: 'Boa Vista', state: 'RR' },
  { city: 'Florianópolis', state: 'SC' },
  { city: 'São Paulo', state: 'SP' },
  { city: 'Aracaju', state: 'SE' },
  { city: 'Palmas', state: 'TO' }
];

async function checkCapitals() {
  console.log('Verificando capitais no banco de dados...\n');
  
  let missing = 0;
  let present = 0;
  const missingList: string[] = [];
  
  for (const capital of capitals) {
    const cityName = `${capital.city} - ${capital.state}`;
    const result = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM professionals 
      WHERE city = ${cityName}
    `);
    
    const count = (result[0] as any)[0].count;
    if (count > 0) {
      console.log(`✅ ${cityName}: ${count} profissionais`);
      present++;
    } else {
      console.log(`❌ ${cityName}: 0 profissionais`);
      missing++;
      missingList.push(cityName);
    }
  }
  
  console.log(`\n📊 Resumo: ${present}/27 capitais com profissionais, ${missing} faltando`);
  
  if (missingList.length > 0) {
    console.log(`\n🔴 Capitais faltando:\n${missingList.join('\n')}`);
  }
}

checkCapitals().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});

