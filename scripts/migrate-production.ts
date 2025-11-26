#!/usr/bin/env node

/**
 * Production Migration Helper Script
 *
 * This script helps deploy the expanded ingredients database and custom ingredients feature
 * to production. It includes verification checks and detailed reporting.
 *
 * Usage:
 *   ts-node scripts/migrate-production.ts [options]
 *
 * Options:
 *   --dry-run     Don't make actual changes, just report what would happen
 *   --verify-only Just verify the current state without making changes
 *   --verbose     Print detailed information
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/db/schema';
import { seedIngredients } from '../src/lib/db/seed/ingredients-data';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerifyOnly = args.includes('--verify-only');
const isVerbose = args.includes('--verbose');

dotenv.config({ path: '.env.local' });

interface MigrationReport {
  timestamp: string;
  environment: string;
  customIngredientsTableExists: boolean;
  currentIngredientCount: number;
  newIngredientsToAdd: number;
  duplicateIngredients: number;
  substitutionCount: number;
  customIngredientsCount: number;
  errors: string[];
  warnings: string[];
}

async function checkCustomIngredientsTable(
  db: ReturnType<typeof drizzle>
): Promise<boolean> {
  try {
    await db.select().from(schema.customIngredients).limit(1);
    return true;
  } catch {
    return false;
  }
}

async function getIngredientStats(db: ReturnType<typeof drizzle>): Promise<{
  count: number;
  categories: Record<string, number>;
}> {
  const results = await db
    .select({
      category: schema.ingredients.category,
      count: sql<number>`count(*)`,
    })
    .from(schema.ingredients)
    .groupBy(schema.ingredients.category);

  const count = results.reduce(
    (sum: number, row: { category: string | null; count: number }) =>
      sum + Number(row.count),
    0
  );
  const categories: Record<string, number> = {};
  results.forEach((row: { category: string | null; count: number }) => {
    categories[row.category || 'null'] = Number(row.count);
  });

  return { count, categories };
}

async function findDuplicateIngredients(
  db: ReturnType<typeof drizzle>
): Promise<string[]> {
  const duplicates: string[] = [];
  const existingIngredients = await db.select().from(schema.ingredients);
  const existingNames = new Set(
    existingIngredients.map((ing: { name: string }) => ing.name.toLowerCase())
  );

  for (const seedIng of seedIngredients) {
    if (existingNames.has(seedIng.name.toLowerCase())) {
      duplicates.push(seedIng.name);
    }
  }

  return duplicates;
}

async function migrate() {
  console.log('\n🔄 Starting Production Migration Helper...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const report: MigrationReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    customIngredientsTableExists: false,
    currentIngredientCount: 0,
    newIngredientsToAdd: 0,
    duplicateIngredients: 0,
    substitutionCount: 0,
    customIngredientsCount: 0,
    errors: [],
    warnings: [],
  };

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema });

  try {
    // Step 1: Verify schema
    console.log('📋 Step 1: Verifying database schema...');
    const tableExists = await checkCustomIngredientsTable(db);
    report.customIngredientsTableExists = tableExists;

    if (!tableExists) {
      report.errors.push('custom_ingredients table does not exist');
      console.log('  ⚠️  custom_ingredients table not found');
      console.log('     Please run migrations first: npm run db:migrate');
    } else {
      console.log('  ✓ custom_ingredients table exists');
    }

    // Step 2: Get current ingredient statistics
    console.log('\n📊 Step 2: Analyzing current ingredients...');
    const stats = await getIngredientStats(db);
    report.currentIngredientCount = stats.count;
    console.log(`  ✓ Current ingredient count: ${stats.count}`);
    if (isVerbose) {
      console.log('    By category:');
      Object.entries(stats.categories).forEach(([cat, count]) => {
        console.log(`      - ${cat}: ${count}`);
      });
    }

    // Step 3: Analyze new ingredients
    console.log('\n🆕 Step 3: Analyzing new ingredients...');
    const duplicates = await findDuplicateIngredients(db);
    const newCount = seedIngredients.length - duplicates.length;
    report.newIngredientsToAdd = newCount;
    report.duplicateIngredients = duplicates.length;

    console.log(
      `  ✓ Seed data contains: ${seedIngredients.length} ingredients`
    );
    console.log(`  ✓ New ingredients to add: ${newCount}`);
    console.log(`  ✓ Already existing: ${duplicates.length}`);

    if (isVerbose && duplicates.length > 0) {
      console.log('    Duplicates:');
      duplicates.slice(0, 20).forEach((name) => {
        console.log(`      - ${name}`);
      });
      if (duplicates.length > 20) {
        console.log(`      ... and ${duplicates.length - 20} more`);
      }
    }

    // Step 4: Check substitutions
    console.log('\n🔗 Step 4: Analyzing substitutions...');
    const substitutions = await db
      .select()
      .from(schema.ingredientSubstitutions);
    report.substitutionCount = substitutions.length;
    console.log(`  ✓ Current substitutions: ${substitutions.length}`);

    // Step 5: Check custom ingredients
    if (tableExists) {
      console.log('\n🏠 Step 5: Checking custom ingredients...');
      const customCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.customIngredients)
        .then((results) => Number(results[0]?.count || 0));
      report.customIngredientsCount = customCount;
      console.log(`  ✓ Current custom ingredients: ${customCount}`);
    }

    // Step 6: Execute migration if not verify-only
    if (!isVerifyOnly && !isDryRun && report.errors.length === 0) {
      console.log('\n💾 Step 6: Seeding new ingredients...');
      const ingredientMap = new Map<string, string>();

      let insertedCount = 0;
      for (const ingredient of seedIngredients) {
        const [result] = await db
          .insert(schema.ingredients)
          .values({
            name: ingredient.name,
            category: ingredient.category,
            commonUnits: ingredient.commonUnits,
          })
          .onConflictDoNothing()
          .returning({
            id: schema.ingredients.id,
            name: schema.ingredients.name,
          });

        if (result) {
          ingredientMap.set(result.name, result.id);
          insertedCount++;
        }
      }

      console.log(`  ✓ Seeded ${insertedCount} new ingredients`);
      console.log(
        `  ✓ Total ingredients in database: ${stats.count + insertedCount}`
      );
    } else if (isDryRun) {
      console.log(
        '\n🧪 DRY RUN: Migration would insert ${newCount} ingredients'
      );
    } else if (isVerifyOnly) {
      console.log(
        '\n✓ Verification complete. No changes made (verify-only mode)'
      );
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 MIGRATION REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp:          ${report.timestamp}`);
    console.log(`Environment:        ${report.environment}`);
    console.log(
      `Custom Ingredients: ${report.customIngredientsTableExists ? 'YES' : 'NO'}`
    );
    console.log(`Current Ingredients: ${report.currentIngredientCount}`);
    console.log(`New Ingredients:    ${report.newIngredientsToAdd}`);
    console.log(`Duplicates Found:   ${report.duplicateIngredients}`);
    console.log(`Substitutions:      ${report.substitutionCount}`);
    console.log(`Custom Ingredients: ${report.customIngredientsCount}`);

    if (report.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      report.errors.forEach((err) => console.log(`  - ${err}`));
    }

    if (report.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      report.warnings.forEach((warn) => console.log(`  - ${warn}`));
    }

    if (report.errors.length === 0) {
      console.log('\n✅ Migration ready for deployment!');
    }

    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    report.errors.push(String(error));
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migration
migrate();
