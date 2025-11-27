# Database Setup Guide

This guide explains how to set up and manage the PostgreSQL database for the Recipe & Pantry Tracker application.

## Overview

The application uses:
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migration Tool**: drizzle-kit
- **Database Client**: postgres.js

## Prerequisites

You need a PostgreSQL database. You can use:
- **Local PostgreSQL** (recommended for development)
- **Vercel Postgres** (for production)
- **Supabase** (alternative for production)
- **Docker** (containerized PostgreSQL)

## Setting Up a Local Database

### Option 1: Using Docker (Recommended)

```bash
# Pull the PostgreSQL image
docker pull postgres:16

# Run PostgreSQL container
docker run --name recipe-tracker-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=recipe_tracker \
  -p 5432:5432 \
  -d postgres:16

# Your DATABASE_URL will be:
# postgresql://postgres:postgres@localhost:5432/recipe_tracker
```

### Option 2: Using Homebrew (macOS)

```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database
createdb recipe_tracker

# Your DATABASE_URL will be:
# postgresql://localhost:5432/recipe_tracker
```

### Option 3: Using apt (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb recipe_tracker

# Your DATABASE_URL will be:
# postgresql://postgres:postgres@localhost:5432/recipe_tracker
```

## Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Update the `DATABASE_URL` in `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/recipe_tracker"
```

Replace `user`, `password`, and connection details with your actual database credentials.

## Database Schema

The application includes the following tables:

### Core Tables
- **users** - User accounts
- **households** - Household groups
- **recipes** - Recipe information
- **recipe_ingredients** - Junction table for recipe ingredients
- **ingredients** - Reference table of all ingredients
- **pantry_items** - Household pantry inventory
- **grocery_lists** - Shopping lists
- **grocery_list_items** - Items in grocery lists

### Supporting Tables
- **ingredient_substitutions** - Ingredient substitution rules

### Enums
- **recipe_category** - breakfast, lunch, dinner, dessert, snack, beverage
- **ingredient_category** - produce, dairy, meat, seafood, pantry, frozen, bakery, other

## Running Migrations

### Generate a New Migration

After changing the schema in `src/lib/db/schema.ts`:

```bash
pnpm db:generate
```

This creates a new SQL migration file in the `drizzle/` directory.

### Apply Migrations

To apply all pending migrations to your database:

```bash
pnpm db:migrate
```

Or push schema changes directly (development only):

```bash
pnpm db:push
```

**Note**: `db:push` is faster for development but doesn't create migration files. Use `db:generate` + `db:migrate` for production.

## Seeding the Database

The application includes seed data for:
- **200+ common ingredients** organized by category
- **150+ ingredient substitutions** with ratios

### Run the Seed Script

```bash
pnpm db:seed
```

This will:
1. Insert all common ingredients into the database
2. Create substitution relationships between ingredients
3. Skip duplicates if seeds have already been run

### Seed Data Contents

**Ingredients** (`src/lib/db/seed/ingredients-data.ts`):
- Produce (vegetables, fruits, herbs)
- Dairy (milk, cheese, eggs)
- Meat (chicken, beef, pork, lamb)
- Seafood (fish, shellfish)
- Pantry (grains, pasta, beans, oils, spices, condiments)
- Bakery (bread, tortillas, buns)
- Frozen items
- Other (beverages, etc.)

**Substitutions** (`src/lib/db/seed/substitutions-data.ts`):
- Butter ↔ Oil (with ratios)
- Milk types (whole, 2%, skim, almond, oat, soy)
- Sugar substitutions (white, brown, honey, maple syrup)
- Flour types
- Fresh ↔ Dried herbs (1:3 ratio)
- Cheese variations
- Broth/stock options
- And many more...

## Database Indexes

The schema includes performance indexes on:

### Recipes
- `idx_recipes_household` - household_id
- `idx_recipes_category` - category
- `idx_recipes_created_by` - created_by

### Recipe Ingredients
- `idx_recipe_ingredients_recipe` - recipe_id
- `idx_recipe_ingredients_ingredient` - ingredient_id

### Pantry Items
- `idx_pantry_household` - household_id
- `idx_pantry_ingredient` - ingredient_id
- `idx_pantry_household_ingredient` - (household_id, ingredient_id) composite

### Ingredients
- `idx_ingredients_name` - name (for autocomplete)
- `idx_ingredients_category` - category

### Ingredient Substitutions
- `idx_substitutions_ingredient` - ingredient_id
- `idx_substitutions_substitute` - substitute_id

### Grocery Lists
- `idx_grocery_lists_household` - household_id
- `idx_grocery_lists_share_token` - share_token

### Grocery List Items
- `idx_grocery_list_items_list` - grocery_list_id
- `idx_grocery_list_items_category` - category

## Drizzle Studio (Database GUI)

View and manage your database visually:

```bash
pnpm db:studio
```

This opens a web interface at `https://local.drizzle.studio` where you can:
- Browse tables and data
- Run queries
- Edit records
- View relationships

## Common Database Commands

### Reset Database (Development Only)

⚠️ **Warning**: This will delete all data!

```bash
# Stop the Docker container (if using Docker)
docker stop recipe-tracker-db
docker rm recipe-tracker-db

# Recreate the container
docker run --name recipe-tracker-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=recipe_tracker \
  -p 5432:5432 \
  -d postgres:16

# Run migrations
pnpm db:push

# Re-seed data
pnpm db:seed
```

### Backup Database

```bash
# Using Docker
docker exec -t recipe-tracker-db pg_dump -U postgres recipe_tracker > backup.sql

# Using local PostgreSQL
pg_dump recipe_tracker > backup.sql
```

### Restore Database

```bash
# Using Docker
docker exec -i recipe-tracker-db psql -U postgres recipe_tracker < backup.sql

# Using local PostgreSQL
psql recipe_tracker < backup.sql
```

## TypeScript Types

Drizzle automatically infers TypeScript types from the schema. Import them like:

```typescript
import { recipes, ingredients, users } from '@/lib/db/schema';
import { db } from '@/lib/db';

// Example query with full type safety
const allRecipes = await db.select().from(recipes);
// allRecipes is typed as Recipe[]
```

## Troubleshooting

### Connection Issues

**Error**: `connection refused`
- Check if PostgreSQL is running: `docker ps` or `brew services list`
- Verify DATABASE_URL in `.env.local`
- Check firewall settings

**Error**: `password authentication failed`
- Verify credentials in DATABASE_URL
- Reset password if needed

### Migration Issues

**Error**: `relation already exists`
- Migrations may have been partially applied
- Check migration history
- Consider resetting the database (development only)

**Error**: `column does not exist`
- Run pending migrations: `pnpm db:migrate`
- Check if schema changes were generated: `pnpm db:generate`

### Seed Issues

**Error**: `duplicate key value violates unique constraint`
- Seeds may have already been run
- The seed script uses `onConflictDoNothing()` to handle duplicates
- Safe to run multiple times

## Production Deployment

### Using Vercel Postgres

1. Create a Postgres database in Vercel dashboard
2. Copy the connection string
3. Add to Vercel environment variables:
   ```
   DATABASE_URL="postgres://..."
   ```
4. Deploy your application
5. Run migrations from local:
   ```bash
   DATABASE_URL="your-production-url" pnpm db:migrate
   ```
6. Run seeds:
   ```bash
   DATABASE_URL="your-production-url" pnpm db:seed
   ```

### Using Supabase

1. Create a project in Supabase
2. Get the connection string from Settings → Database
3. Use the "Transaction" pooler URL
4. Follow same deployment steps as Vercel Postgres

## Best Practices

1. **Never commit `.env.local`** - Contains sensitive credentials
2. **Always generate migrations** - Use `db:generate` before `db:migrate`
3. **Test migrations** - Test on development database first
4. **Backup production** - Before running migrations in production
5. **Use indexes wisely** - All foreign keys and frequently queried columns are indexed
6. **Review generated SQL** - Check migration files before applying

## Schema Diagram

```
households
  ├─ users (household_id)
  ├─ recipes (household_id)
  ├─ pantry_items (household_id)
  └─ grocery_lists (household_id)

recipes
  ├─ recipe_ingredients (recipe_id)
  └─ created_by → users

ingredients
  ├─ recipe_ingredients (ingredient_id)
  ├─ pantry_items (ingredient_id)
  ├─ grocery_list_items (ingredient_id)
  └─ ingredient_substitutions (ingredient_id, substitute_id)

grocery_lists
  └─ grocery_list_items (grocery_list_id)
```

## Next Steps

After setting up the database:

1. ✅ Database created and running
2. ✅ Environment variables configured
3. ✅ Migrations applied (`pnpm db:migrate`)
4. ✅ Seed data loaded (`pnpm db:seed`)
5. → Start development server (`pnpm dev`)
6. → Implement API endpoints
7. → Build UI components

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Database Guide](https://nextjs.org/docs/app/building-your-application/data-fetching)
