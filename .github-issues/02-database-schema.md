# Database Schema Design and Implementation

**Phase:** 1 - Foundation
**Priority:** P0
**Estimate:** 4 days

## Description

Design and implement the complete database schema for the Recipe & Pantry Tracker application based on the data models defined in the PRD.

## Tasks

### Schema Design
- [ ] Create database schema based on PRD data models
- [ ] Design all tables with proper relationships
- [ ] Add appropriate indexes for performance
- [ ] Define constraints and validations
- [ ] Create enum types for categories

### Core Tables
- [ ] `users` table
- [ ] `households` table
- [ ] `household_members` junction table
- [ ] `recipes` table
- [ ] `recipe_ingredients` table
- [ ] `ingredients` table (reference data)
- [ ] `pantry_items` table
- [ ] `grocery_lists` table
- [ ] `grocery_list_items` table

### Supporting Tables
- [ ] `ingredient_substitutions` table
- [ ] `sessions` table (for auth)
- [ ] `recipe_history` table (optional - for tracking when recipes are cooked)

### Seed Data
- [ ] Seed common ingredients (200+ items)
- [ ] Seed ingredient categories
- [ ] Seed common substitutions
- [ ] Create test household data for development

### Migrations
- [ ] Create initial migration file
- [ ] Test migration up/down
- [ ] Document migration commands

## Acceptance Criteria

- [ ] All tables created with proper types
- [ ] Foreign key relationships established
- [ ] Indexes created on all foreign keys and frequently queried columns
- [ ] Seed data script runs successfully
- [ ] Migration can be rolled back cleanly
- [ ] Database diagram/documentation created
- [ ] TypeScript types generated from schema

## Technical Details

### Key Tables Structure

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  household_id UUID REFERENCES households(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**recipes**
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  source_url TEXT,
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  instructions TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**recipe_ingredients**
```sql
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity DECIMAL(10, 2),
  unit VARCHAR(50),
  notes TEXT,
  optional BOOLEAN DEFAULT FALSE,
  substitution_group VARCHAR(100),
  order_index INTEGER
);
```

### Important Indexes

```sql
CREATE INDEX idx_recipes_household ON recipes(household_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_pantry_household ON pantry_items(household_id);
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);
```

## Dependencies

- [ ] #01 Project Setup completed
- Database provider selected and configured

## Resources

- PRD Section 5.3: Data Models
- Implementation Plan: Database Schema Setup
