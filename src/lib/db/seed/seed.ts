import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import { seedIngredients } from './ingredients-data';
import { seedSubstitutions } from './substitutions-data';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seed() {
  console.log('🌱 Starting database seed...');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema });

  try {
    // Seed ingredients
    console.log('📦 Seeding ingredients...');
    const ingredientMap = new Map<string, string>(); // name -> id

    for (const ingredient of seedIngredients) {
      const [result] = await db
        .insert(schema.ingredients)
        .values({
          name: ingredient.name,
          category: ingredient.category,
          commonUnits: ingredient.commonUnits,
        })
        .onConflictDoNothing()
        .returning({ id: schema.ingredients.id, name: schema.ingredients.name });

      if (result) {
        ingredientMap.set(result.name, result.id);
      }
    }

    console.log(`✅ Seeded ${ingredientMap.size} ingredients`);

    // If no ingredients were inserted, fetch existing ones
    if (ingredientMap.size === 0) {
      console.log('📥 Fetching existing ingredients...');
      const existingIngredients = await db.select().from(schema.ingredients);
      for (const ing of existingIngredients) {
        ingredientMap.set(ing.name, ing.id);
      }
      console.log(`✅ Found ${ingredientMap.size} existing ingredients`);
    }

    // Seed substitutions
    console.log('🔄 Seeding ingredient substitutions...');
    let substitutionsCount = 0;

    for (const substitution of seedSubstitutions) {
      const ingredientId = ingredientMap.get(substitution.ingredientName);
      const substituteId = ingredientMap.get(substitution.substituteName);

      if (!ingredientId || !substituteId) {
        console.warn(
          `⚠️  Skipping substitution: ${substitution.ingredientName} -> ${substitution.substituteName} (ingredient not found)`
        );
        continue;
      }

      await db
        .insert(schema.ingredientSubstitutions)
        .values({
          ingredientId,
          substituteId,
          ratio: substitution.ratio,
          notes: substitution.notes,
        })
        .onConflictDoNothing();

      substitutionsCount++;
    }

    console.log(`✅ Seeded ${substitutionsCount} substitutions`);
    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✨ Seed process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed process failed:', error);
      process.exit(1);
    });
}

export { seed };
