# Production Deployment Guide: Expanded Ingredients & Custom Ingredients Feature

This guide covers deploying the expanded ingredient database (900+ items) and the custom ingredients feature to production.

## Overview

This release includes:

- **Expanded Ingredients Database**: 941 common cooking ingredients (previously 336)
- **Custom Ingredients Feature**: Users can now create household-scoped ingredients
- **Ingredient Validation**: Prevents duplicate ingredients with the default database
- **Household Sharing**: Custom ingredients are shared across all household members

## Prerequisites

Before deploying to production:

1. **Backup your production database**

   ```bash
   # Using pg_dump
   pg_dump postgresql://user:password@host/recipe_tracker > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Ensure you have the latest code**

   ```bash
   git checkout main
   git pull origin main
   ```

3. **Verify environment variables**
   - `DATABASE_URL` points to the production database
   - Check `.env.production` for any required settings

## Deployment Steps

### Step 1: Database Migration (Schema Changes)

The custom ingredients feature requires the following schema changes:

```sql
-- New table for custom ingredients
CREATE TABLE custom_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  default_unit text,
  category ingredient_category,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  UNIQUE(household_id, name)
);

CREATE INDEX idx_custom_ingredients_household ON custom_ingredients(household_id);
```

**Using Drizzle ORM Migration:**
If you're using Drizzle migrations, run:

```bash
npm run db:migrate
```

### Step 2: Seed Expanded Ingredients Database

To populate the production database with 941+ ingredients:

```bash
# Set your production DATABASE_URL first
DATABASE_URL="postgresql://user:password@host/recipe_tracker" npm run seed
```

This script will:

- Insert 941 ingredients from the expanded seed data
- Skip any ingredients that already exist (using `onConflictDoNothing`)
- Seed ingredient substitutions
- Print a summary of inserted/existing items

**Example output:**

```
🌱 Starting database seed...
📦 Seeding ingredients...
✅ Seeded 605 new ingredients (336 already existed)
🔄 Seeding ingredient substitutions...
✅ Seeded 1,247 substitutions
🎉 Database seed completed successfully!
```

### Step 3: Deploy Application Code

Deploy your application code changes:

```bash
# Build the application
npm run build

# Deploy to your production environment
# (using your deployment service - Vercel, Docker, etc.)
```

### Step 4: Verify Deployment

After deployment, verify the changes:

```bash
# 1. Check ingredient count in database
psql postgresql://user:password@host/recipe_tracker -c "SELECT COUNT(*) FROM ingredients;"

# Expected: 941+ ingredients

# 2. Verify custom_ingredients table exists
psql postgresql://user:password@host/recipe_tracker -c "\dt custom_ingredients"

# Expected: Table should exist with proper columns

# 3. Test API endpoint with production domain
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-app.com/api/ingredients/search?q=tomato&limit=10"

# Expected: Response should include both default and any custom ingredients
```

## Rollback Procedure

If you need to rollback the changes:

### Option 1: Revert to Previous Version

```bash
git revert <commit-hash>
git push origin main
```

### Option 2: Restore Database Backup

```bash
# Restore from backup
psql postgresql://user:password@host/recipe_tracker < backup_YYYYMMDD_HHMMSS.sql
```

## Testing Custom Ingredients Feature

After deployment, test the custom ingredients feature:

1. **Create a custom ingredient:**

   ```bash
   curl -X POST https://your-app.com/api/ingredients/custom \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "name": "Specialty Flour",
       "defaultUnit": "cups",
       "category": "pantry"
     }'
   ```

2. **Search for ingredients (should include custom ones):**

   ```bash
   curl https://your-app.com/api/ingredients/search?q=specialty \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Verify duplicate prevention:**

   ```bash
   curl -X POST https://your-app.com/api/ingredients/custom \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "name": "Tomato",  // This exists in default database
       "category": "produce"
     }'

   # Expected: 409 Conflict - "This ingredient already exists in the database"
   ```

## Performance Considerations

- **Database indexes**: New indexes on `household_id` and `(household_id, name)` improve query performance
- **Search performance**: Ingredient search now returns combined results from default and custom ingredients; consider implementing pagination if the result set becomes large
- **Household size**: Custom ingredients scale well with household size due to proper indexing

## Breaking Changes

None. This is a backward-compatible release that adds new features without removing existing functionality.

## Migration Checklist

Before considering the deployment complete:

- [ ] Database backup created
- [ ] Schema migration applied (custom_ingredients table created)
- [ ] Expanded ingredients seeded (941 total)
- [ ] Application code deployed
- [ ] API endpoints responding correctly
- [ ] Search includes both default and custom ingredients
- [ ] Duplicate prevention working
- [ ] Custom ingredients shared across household members
- [ ] Monitored for 24 hours for errors

## Support

If issues occur during deployment:

1. Check application logs for errors
2. Verify database connectivity
3. Review the rollback procedure above
4. Contact development team for assistance

## Additional Resources

- [Custom Ingredients Feature Specification](./github-enhancements/002-custom-ingredients.md)
- [API Documentation](./API_DOCS.md)
- [Database Schema](./src/lib/db/schema.ts)
