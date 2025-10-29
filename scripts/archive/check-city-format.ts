import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function checkCities() {
  const result = await db.execute(sql`SELECT DISTINCT city FROM professionals ORDER BY city LIMIT 50`);
  console.log('Primeiras 50 cidades no banco:\n');
  (result[0] as any[]).forEach((r: any) => console.log(r.city));
}

checkCities().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});

