import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
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
  passwordResetToken: text('password_reset_token'),
  passwordResetTokenExpiresAt: timestamp('password_reset_token_expires_at'),
  householdId: uuid('household_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Households table
export const households = pgTable('households', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Household invites table
export const householdInvites = pgTable(
  'household_invites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    householdId: uuid('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    code: text('code').notNull().unique(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp('expires_at').notNull(),
    usedBy: uuid('used_by').references(() => users.id),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: index('idx_invites_code').on(table.code),
    householdIdx: index('idx_invites_household').on(table.householdId),
  })
);

// Ingredients table
export const ingredients = pgTable(
  'ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    category: ingredientCategoryEnum('category').notNull(),
    commonUnits: text('common_units').array(),
    householdId: uuid('household_id').references(() => households.id, {
      onDelete: 'cascade',
    }),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('idx_ingredients_name').on(table.name),
    categoryIdx: index('idx_ingredients_category').on(table.category),
    householdIdx: index('idx_ingredients_household').on(table.householdId),
    uniqueHouseholdIngredient: uniqueIndex('idx_ingredients_household_name').on(
      table.householdId,
      table.name
    ),
    uniqueDefaultIngredient: uniqueIndex('idx_ingredients_name_default').on(
      table.name
    ),
  })
);

// Ingredient substitutions table
export const ingredientSubstitutions = pgTable(
  'ingredient_substitutions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    substituteId: uuid('substitute_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    ratio: decimal('ratio', { precision: 5, scale: 2 }).default('1.00'),
    notes: text('notes'),
  },
  (table) => ({
    ingredientIdx: index('idx_substitutions_ingredient').on(table.ingredientId),
    substituteIdx: index('idx_substitutions_substitute').on(table.substituteId),
  })
);

// Recipes table
export const recipes = pgTable(
  'recipes',
  {
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
    avgRating: decimal('avg_rating', { precision: 2, scale: 1 }),
    ratingCount: integer('rating_count').default(0),
    instructions: text('instructions').array().notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    householdIdx: index('idx_recipes_household').on(table.householdId),
    categoryIdx: index('idx_recipes_category').on(table.category),
    createdByIdx: index('idx_recipes_created_by').on(table.createdBy),
  })
);

// Recipe ingredients junction table
export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    quantity: decimal('quantity', { precision: 10, scale: 2 }),
    unit: text('unit'),
    notes: text('notes'),
    optional: boolean('optional').default(false),
    substitutionGroup: text('substitution_group'),
  },
  (table) => ({
    recipeIdx: index('idx_recipe_ingredients_recipe').on(table.recipeId),
    ingredientIdx: index('idx_recipe_ingredients_ingredient').on(
      table.ingredientId
    ),
  })
);

// Pantry items table
export const pantryItems = pgTable(
  'pantry_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    householdId: uuid('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    quantity: decimal('quantity', { precision: 10, scale: 2 }),
    unit: text('unit'),
    addedBy: uuid('added_by')
      .notNull()
      .references(() => users.id),
    purchaseDate: timestamp('purchase_date'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    householdIdx: index('idx_pantry_household').on(table.householdId),
    ingredientIdx: index('idx_pantry_ingredient').on(table.ingredientId),
    householdIngredientIdx: index('idx_pantry_household_ingredient').on(
      table.householdId,
      table.ingredientId
    ),
  })
);

// Recipe history table (for tracking when recipes are cooked)
export const recipeHistory = pgTable(
  'recipe_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    householdId: uuid('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    cookedBy: uuid('cooked_by')
      .notNull()
      .references(() => users.id),
    servings: integer('servings').notNull(),
    cookedAt: timestamp('cooked_at').defaultNow().notNull(),
  },
  (table) => ({
    recipeIdx: index('idx_recipe_history_recipe').on(table.recipeId),
    householdIdx: index('idx_recipe_history_household').on(table.householdId),
    cookedAtIdx: index('idx_recipe_history_date').on(table.cookedAt),
  })
);

// Recipe notes table (for notes added during cooking)
export const recipeNotes = pgTable(
  'recipe_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    noteText: text('note_text').notNull(),
    stepNumber: integer('step_number'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    sessionId: uuid('session_id').references(() => recipeHistory.id, {
      onDelete: 'set null',
    }),
  },
  (table) => ({
    userRecipeIdx: index('idx_recipe_notes_user_recipe').on(
      table.userId,
      table.recipeId
    ),
    recipeIdx: index('idx_recipe_notes_recipe').on(table.recipeId),
    sessionIdx: index('idx_recipe_notes_session').on(table.sessionId),
    stepIdx: index('idx_recipe_notes_step').on(
      table.recipeId,
      table.stepNumber
    ),
  })
);

// Recipe ratings table (for tracking user ratings of recipes)
export const recipeRatings = pgTable(
  'recipe_ratings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    householdId: uuid('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    ratedAt: timestamp('rated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    recipeIdx: index('idx_recipe_ratings_recipe').on(table.recipeId),
    userIdx: index('idx_recipe_ratings_user').on(table.userId),
    householdIdx: index('idx_recipe_ratings_household').on(table.householdId),
  })
);

// Grocery lists table
export const groceryLists = pgTable(
  'grocery_lists',
  {
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
  },
  (table) => ({
    householdIdx: index('idx_grocery_lists_household').on(table.householdId),
    shareTokenIdx: index('idx_grocery_lists_share_token').on(table.shareToken),
  })
);

// Grocery list items table
export const groceryListItems = pgTable(
  'grocery_list_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groceryListId: uuid('grocery_list_id')
      .notNull()
      .references(() => groceryLists.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
    unit: text('unit'),
    category: ingredientCategoryEnum('category').notNull(),
    store: text('store'),
    checked: boolean('checked').default(false),
    checkedBy: uuid('checked_by').references(() => users.id),
    checkedAt: timestamp('checked_at'),
    recipeIds: uuid('recipe_ids').array(),
  },
  (table) => ({
    groceryListIdx: index('idx_grocery_list_items_list').on(
      table.groceryListId
    ),
    categoryIdx: index('idx_grocery_list_items_category').on(table.category),
    storeIdx: index('idx_grocery_list_items_store').on(table.store),
  })
);

// Household category order table
export const householdCategoryOrder = pgTable('household_category_order', {
  householdId: uuid('household_id')
    .primaryKey()
    .references(() => households.id, { onDelete: 'cascade' }),
  categoryOrder: text('category_order')
    .array()
    .notNull()
    .default([
      'produce',
      'bakery',
      'dairy',
      'meat',
      'seafood',
      'frozen',
      'pantry',
      'other',
    ]),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Custom ingredients table (household-created ingredients)
export const customIngredients = pgTable(
  'custom_ingredients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    householdId: uuid('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    defaultUnit: text('default_unit'),
    category: ingredientCategoryEnum('category'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    householdIdIdx: index('idx_custom_ingredients_household').on(
      table.householdId
    ),
    uniqueHouseholdIngredient: uniqueIndex(
      'idx_custom_ingredients_household_name'
    ).on(table.householdId, table.name),
  })
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  household: one(households, {
    fields: [users.householdId],
    references: [households.id],
  }),
  recipes: many(recipes),
  pantryItems: many(pantryItems),
  groceryLists: many(groceryLists),
  recipeNotes: many(recipeNotes),
  recipeRatings: many(recipeRatings),
  createdInvites: many(householdInvites, {
    relationName: 'inviteCreator',
  }),
  usedInvites: many(householdInvites, {
    relationName: 'inviteUser',
  }),
}));

export const householdsRelations = relations(households, ({ one, many }) => ({
  members: many(users),
  recipes: many(recipes),
  pantryItems: many(pantryItems),
  groceryLists: many(groceryLists),
  customIngredients: many(customIngredients),
  invites: many(householdInvites),
  categoryOrder: one(householdCategoryOrder, {
    fields: [households.id],
    references: [householdCategoryOrder.householdId],
  }),
  creator: one(users, {
    fields: [households.createdBy],
    references: [users.id],
  }),
}));

export const householdInvitesRelations = relations(
  householdInvites,
  ({ one }) => ({
    household: one(households, {
      fields: [householdInvites.householdId],
      references: [households.id],
    }),
    createdByUser: one(users, {
      fields: [householdInvites.createdBy],
      references: [users.id],
      relationName: 'inviteCreator',
    }),
    usedByUser: one(users, {
      fields: [householdInvites.usedBy],
      references: [users.id],
      relationName: 'inviteUser',
    }),
  })
);

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
  notes: many(recipeNotes),
  ratings: many(recipeRatings),
  history: many(recipeHistory),
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

export const recipeHistoryRelations = relations(
  recipeHistory,
  ({ one, many }) => ({
    recipe: one(recipes, {
      fields: [recipeHistory.recipeId],
      references: [recipes.id],
    }),
    household: one(households, {
      fields: [recipeHistory.householdId],
      references: [households.id],
    }),
    cookedByUser: one(users, {
      fields: [recipeHistory.cookedBy],
      references: [users.id],
    }),
    notes: many(recipeNotes),
  })
);

export const recipeNotesRelations = relations(recipeNotes, ({ one }) => ({
  user: one(users, {
    fields: [recipeNotes.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [recipeNotes.recipeId],
    references: [recipes.id],
  }),
  session: one(recipeHistory, {
    fields: [recipeNotes.sessionId],
    references: [recipeHistory.id],
  }),
}));

export const recipeRatingsRelations = relations(recipeRatings, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeRatings.recipeId],
    references: [recipes.id],
  }),
  user: one(users, {
    fields: [recipeRatings.userId],
    references: [users.id],
  }),
  household: one(households, {
    fields: [recipeRatings.householdId],
    references: [households.id],
  }),
}));

export const householdCategoryOrderRelations = relations(
  householdCategoryOrder,
  ({ one }) => ({
    household: one(households, {
      fields: [householdCategoryOrder.householdId],
      references: [households.id],
    }),
  })
);

export const customIngredientsRelations = relations(
  customIngredients,
  ({ one }) => ({
    household: one(households, {
      fields: [customIngredients.householdId],
      references: [households.id],
    }),
    createdByUser: one(users, {
      fields: [customIngredients.createdBy],
      references: [users.id],
    }),
  })
);
