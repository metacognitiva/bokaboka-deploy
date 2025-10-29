import { drizzle } from "drizzle-orm/mysql2";
import { professionals } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log("🖼️  Adding gallery photos to professionals...");

  const allProfessionals = await db.select().from(professionals);

  for (const prof of allProfessionals) {
    // Generate 2-5 gallery photos per professional
    const photoCount = Math.floor(2 + Math.random() * 4);
    const galleryPhotos = [];
    
    for (let i = 0; i < photoCount; i++) {
      const randomImg = Math.floor(1 + Math.random() * 70);
      galleryPhotos.push(`https://picsum.photos/800/600?random=${prof.id}-${i}`);
    }

    await db
      .update(professionals)
      .set({ galleryPhotos: JSON.stringify(galleryPhotos) })
      .where({ id: prof.id } as any);
  }

  console.log(`✅ Updated ${allProfessionals.length} professionals with gallery photos`);
}

main()
  .catch((error) => {
    console.error("❌ Update failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });

