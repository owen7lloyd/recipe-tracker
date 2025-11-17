import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const recipeCategoryEnum = pgEnum('recipe_category', [
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'snack',
  'beverage',
]);

export const ingredientCategoryEnum = pgEnum('ingredient_category', [
  'produce',
  'dairy',
  'meat',
  'seafood',
  'pantry',
  'frozen',
  'bakery',
  'other',
]);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  householdId: uuid('household_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Households table
export const households = pgTable('households', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  inviteCode: text('invite_code').unique(),
  inviteExpiresAt: timestamp('invite_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Ingredients table
export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  category: ingredientCategoryEnum('category').notNull(),
  commonUnits: text('common_units').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Ingredient substitutions table
export const ingredientSubstitutions = pgTable('ingredient_substitutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  ingredientId: uuid('ingredient_id')
    .notNull()
    .references(() => ingredients.id, { onDelete: 'cascade' }),
  substituteId: uuid('substitute_id')
    .notNull()
    .references(() => ingredients.id, { onDelete: 'cascade' }),
  ratio: decimal('ratio', { precision: 5, scale: 2 }).default('1.00'),
  notes: text('notes'),
});

// Recipes table
export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  sourceUrl: text('source_url'),
  category: recipeCategoryEnum('category').notNull(),
  tags: text('tags').array(),
  prepTimeMinutes: integer('prep_time_minutes'),
  cookTimeMinutes: integer('cook_time_minutes'),
  servings: integer('servings').notNull().default(4),
  rating: integer('rating'),
  instructions: text('instructions').array().notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Recipe ingredients junction table
export const recipeIngredients = pgTable('recipe_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id')
    .notNull()
    .references(() => ingredients.id),
  quantity: decimal('quantity', { precision: 10, scale: 2 }),
  unit: text('unit'),
  notes: text('notes'),
  optional: boolean('optional').default(false),
  substitutionGroup: text('substitution_group'),
});

// Pantry items table
export const pantryItems = pgTable('pantry_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id')
    .notNull()
    .references(() => ingredients.id),
  quantity: decimal('quantity', { precision: 10, scale: 2 }),
  unit: text('unit'),
  addedBy: uuid('added_by')
    .notNull()
    .references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Grocery lists table
export const groceryLists = pgTable('grocery_lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  shareToken: text('share_token').unique(),
  shareExpiresAt: timestamp('share_expires_at'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Grocery list items table
export const groceryListItems = pgTable('grocery_list_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  groceryListId: uuid('grocery_list_id')
    .notNull()
    .references(() => groceryLists.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id')
    .notNull()
    .references(() => ingredients.id),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit'),
  category: ingredientCategoryEnum('category').notNull(),
  checked: boolean('checked').default(false),
  checkedBy: uuid('checked_by').references(() => users.id),
  checkedAt: timestamp('checked_at'),
  recipeIds: uuid('recipe_ids').array(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  household: one(households, {
    fields: [users.householdId],
    references: [households.id],
  }),
  recipes: many(recipes),
  pantryItems: many(pantryItems),
  groceryLists: many(groceryLists),
}));

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(users),
  recipes: many(recipes),
  pantryItems: many(pantryItems),
  groceryLists: many(groceryLists),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  household: one(households, {
    fields: [recipes.householdId],
    references: [households.id],
  }),
  creator: one(users, {
    fields: [recipes.createdBy],
    references: [users.id],
  }),
  ingredients: many(recipeIngredients),
}));

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  pantryItems: many(pantryItems),
  groceryListItems: many(groceryListItems),
  substitutions: many(ingredientSubstitutions, {
    relationName: 'ingredient',
  }),
  substitutes: many(ingredientSubstitutions, {
    relationName: 'substitute',
  }),
}));

export const recipeIngredientsRelations = relations(
  recipeIngredients,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredients.recipeId],
      references: [recipes.id],
    }),
    ingredient: one(ingredients, {
      fields: [recipeIngredients.ingredientId],
      references: [ingredients.id],
    }),
  })
);

export const pantryItemsRelations = relations(pantryItems, ({ one }) => ({
  household: one(households, {
    fields: [pantryItems.householdId],
    references: [households.id],
  }),
  ingredient: one(ingredients, {
    fields: [pantryItems.ingredientId],
    references: [ingredients.id],
  }),
  addedByUser: one(users, {
    fields: [pantryItems.addedBy],
    references: [users.id],
  }),
}));

export const groceryListsRelations = relations(
  groceryLists,
  ({ one, many }) => ({
    household: one(households, {
      fields: [groceryLists.householdId],
      references: [households.id],
    }),
    creator: one(users, {
      fields: [groceryLists.createdBy],
      references: [users.id],
    }),
    items: many(groceryListItems),
  })
);

export const groceryListItemsRelations = relations(
  groceryListItems,
  ({ one }) => ({
    groceryList: one(groceryLists, {
      fields: [groceryListItems.groceryListId],
      references: [groceryLists.id],
    }),
    ingredient: one(ingredients, {
      fields: [groceryListItems.ingredientId],
      references: [ingredients.id],
    }),
    checkedByUser: one(users, {
      fields: [groceryListItems.checkedBy],
      references: [users.id],
    }),
  })
);

export const ingredientSubstitutionsRelations = relations(
  ingredientSubstitutions,
  ({ one }) => ({
    ingredient: one(ingredients, {
      fields: [ingredientSubstitutions.ingredientId],
      references: [ingredients.id],
      relationName: 'ingredient',
    }),
    substitute: one(ingredients, {
      fields: [ingredientSubstitutions.substituteId],
      references: [ingredients.id],
      relationName: 'substitute',
    }),
  })
);
