/**
 * Common ingredient substitutions
 * Format: ingredient name -> substitute name with ratio
 */

export interface SeedSubstitution {
  ingredientName: string;
  substituteName: string;
  ratio: string; // decimal string, e.g., "1.00" means 1:1 substitution
  notes?: string;
}

export const seedSubstitutions: SeedSubstitution[] = [
  // Butter <-> Oil substitutions
  {
    ingredientName: 'Butter',
    substituteName: 'Olive Oil',
    ratio: '0.75',
    notes: 'Use 3/4 cup oil for 1 cup butter in baking',
  },
  {
    ingredientName: 'Butter',
    substituteName: 'Vegetable Oil',
    ratio: '0.75',
    notes: 'Use 3/4 cup oil for 1 cup butter in baking',
  },
  {
    ingredientName: 'Butter',
    substituteName: 'Coconut Oil',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Butter',
    substituteName: 'Margarine',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Unsalted Butter',
    substituteName: 'Salted Butter',
    ratio: '1.00',
    notes: 'Reduce salt in recipe by 1/4 tsp per stick',
  },

  // Milk substitutions
  {
    ingredientName: 'Whole Milk',
    substituteName: '2% Milk',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Whole Milk',
    substituteName: 'Skim Milk',
    ratio: '1.00',
    notes: '1:1 substitution, may be less rich',
  },
  {
    ingredientName: 'Whole Milk',
    substituteName: 'Almond Milk',
    ratio: '1.00',
    notes: '1:1 substitution for most recipes',
  },
  {
    ingredientName: 'Whole Milk',
    substituteName: 'Oat Milk',
    ratio: '1.00',
    notes: '1:1 substitution, good for baking',
  },
  {
    ingredientName: 'Whole Milk',
    substituteName: 'Soy Milk',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: '2% Milk',
    substituteName: 'Whole Milk',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: '2% Milk',
    substituteName: 'Skim Milk',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: '2% Milk',
    substituteName: 'Almond Milk',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Almond Milk',
    substituteName: 'Oat Milk',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Almond Milk',
    substituteName: 'Soy Milk',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Oat Milk',
    substituteName: 'Soy Milk',
    ratio: '1.00',
    notes: '1:1 substitution',
  },

  // Heavy cream substitutions
  {
    ingredientName: 'Heavy Cream',
    substituteName: 'Half and Half',
    ratio: '1.00',
    notes: 'Works for most recipes, less rich',
  },
  {
    ingredientName: 'Half and Half',
    substituteName: 'Whole Milk',
    ratio: '1.00',
    notes: 'Less creamy but works in a pinch',
  },

  // Sour cream substitutions
  {
    ingredientName: 'Sour Cream',
    substituteName: 'Greek Yogurt',
    ratio: '1.00',
    notes: '1:1 substitution, healthier option',
  },
  {
    ingredientName: 'Sour Cream',
    substituteName: 'Yogurt',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Greek Yogurt',
    substituteName: 'Sour Cream',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Greek Yogurt',
    substituteName: 'Yogurt',
    ratio: '1.00',
    notes: '1:1 substitution',
  },

  // Sugar substitutions
  {
    ingredientName: 'White Sugar',
    substituteName: 'Brown Sugar',
    ratio: '1.00',
    notes: 'Adds molasses flavor',
  },
  {
    ingredientName: 'White Sugar',
    substituteName: 'Honey',
    ratio: '0.75',
    notes: 'Use 3/4 cup honey for 1 cup sugar, reduce liquid',
  },
  {
    ingredientName: 'White Sugar',
    substituteName: 'Maple Syrup',
    ratio: '0.75',
    notes: 'Use 3/4 cup syrup for 1 cup sugar, reduce liquid',
  },
  {
    ingredientName: 'Brown Sugar',
    substituteName: 'White Sugar',
    ratio: '1.00',
    notes: 'Less molasses flavor',
  },
  {
    ingredientName: 'Brown Sugar',
    substituteName: 'Honey',
    ratio: '0.75',
    notes: 'Use 3/4 cup honey for 1 cup brown sugar',
  },
  {
    ingredientName: 'Honey',
    substituteName: 'Maple Syrup',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Honey',
    substituteName: 'Agave Nectar',
    ratio: '1.00',
    notes: '1:1 substitution',
  },

  // Flour substitutions
  {
    ingredientName: 'All-Purpose Flour',
    substituteName: 'Bread Flour',
    ratio: '1.00',
    notes: 'Slightly chewier texture',
  },
  {
    ingredientName: 'All-Purpose Flour',
    substituteName: 'Whole Wheat Flour',
    ratio: '1.00',
    notes: 'Denser, use 50/50 mix for best results',
  },
  {
    ingredientName: 'Bread Flour',
    substituteName: 'All-Purpose Flour',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Cake Flour',
    substituteName: 'All-Purpose Flour',
    ratio: '1.00',
    notes: 'Remove 2 tbsp per cup and add 2 tbsp cornstarch',
  },

  // Fresh <-> Dried Herbs (1:3 ratio - 1 tbsp fresh = 1 tsp dried)
  {
    ingredientName: 'Basil',
    substituteName: 'Dried Basil',
    ratio: '0.33',
    notes: '1 tbsp fresh = 1 tsp dried',
  },
  {
    ingredientName: 'Dried Basil',
    substituteName: 'Basil',
    ratio: '3.00',
    notes: '1 tsp dried = 1 tbsp fresh',
  },
  {
    ingredientName: 'Parsley',
    substituteName: 'Dried Parsley',
    ratio: '0.33',
    notes: '1 tbsp fresh = 1 tsp dried',
  },
  {
    ingredientName: 'Dried Parsley',
    substituteName: 'Parsley',
    ratio: '3.00',
    notes: '1 tsp dried = 1 tbsp fresh',
  },
  {
    ingredientName: 'Oregano',
    substituteName: 'Dried Oregano',
    ratio: '0.33',
    notes: '1 tbsp fresh = 1 tsp dried',
  },
  {
    ingredientName: 'Dried Oregano',
    substituteName: 'Oregano',
    ratio: '3.00',
    notes: '1 tsp dried = 1 tbsp fresh',
  },
  {
    ingredientName: 'Thyme',
    substituteName: 'Dried Thyme',
    ratio: '0.33',
    notes: '1 tbsp fresh = 1 tsp dried',
  },
  {
    ingredientName: 'Dried Thyme',
    substituteName: 'Thyme',
    ratio: '3.00',
    notes: '1 tsp dried = 1 tbsp fresh',
  },
  {
    ingredientName: 'Rosemary',
    substituteName: 'Dried Rosemary',
    ratio: '0.33',
    notes: '1 tbsp fresh = 1 tsp dried',
  },
  {
    ingredientName: 'Dried Rosemary',
    substituteName: 'Rosemary',
    ratio: '3.00',
    notes: '1 tsp dried = 1 tbsp fresh',
  },
  {
    ingredientName: 'Dill',
    substituteName: 'Dried Dill',
    ratio: '0.33',
    notes: '1 tbsp fresh = 1 tsp dried',
  },
  {
    ingredientName: 'Dried Dill',
    substituteName: 'Dill',
    ratio: '3.00',
    notes: '1 tsp dried = 1 tbsp fresh',
  },

  // Cheese substitutions
  {
    ingredientName: 'Cheddar Cheese',
    substituteName: 'Monterey Jack Cheese',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Cheddar Cheese',
    substituteName: 'Mozzarella Cheese',
    ratio: '1.00',
    notes: '1:1 substitution, milder flavor',
  },
  {
    ingredientName: 'Monterey Jack Cheese',
    substituteName: 'Pepper Jack Cheese',
    ratio: '1.00',
    notes: 'Adds spice',
  },
  {
    ingredientName: 'Monterey Jack Cheese',
    substituteName: 'Mozzarella Cheese',
    ratio: '1.00',
    notes: '1:1 substitution',
  },

  // Onion variations
  {
    ingredientName: 'Onion',
    substituteName: 'Shallot',
    ratio: '1.00',
    notes: 'Milder, sweeter flavor',
  },
  {
    ingredientName: 'Onion',
    substituteName: 'Scallions',
    ratio: '1.00',
    notes: 'Milder flavor, use white and green parts',
  },
  {
    ingredientName: 'Shallot',
    substituteName: 'Onion',
    ratio: '1.00',
    notes: 'Stronger flavor',
  },

  // Garlic substitutions
  {
    ingredientName: 'Garlic',
    substituteName: 'Garlic Powder',
    ratio: '0.125',
    notes: '1 clove = 1/8 tsp powder',
  },
  {
    ingredientName: 'Garlic Powder',
    substituteName: 'Garlic',
    ratio: '8.00',
    notes: '1 tsp powder = 8 cloves',
  },

  // Ginger substitutions
  {
    ingredientName: 'Ginger',
    substituteName: 'Ginger Powder',
    ratio: '0.25',
    notes: '1 tbsp fresh = 1/4 tsp powder',
  },
  {
    ingredientName: 'Ginger Powder',
    substituteName: 'Ginger',
    ratio: '4.00',
    notes: '1 tsp powder = 1 tbsp fresh grated',
  },

  // Pepper substitutions
  {
    ingredientName: 'Bell Pepper',
    substituteName: 'Red Bell Pepper',
    ratio: '1.00',
    notes: 'Sweeter',
  },
  {
    ingredientName: 'Bell Pepper',
    substituteName: 'Green Bell Pepper',
    ratio: '1.00',
    notes: 'More bitter',
  },
  {
    ingredientName: 'Bell Pepper',
    substituteName: 'Yellow Bell Pepper',
    ratio: '1.00',
    notes: 'Sweeter',
  },
  {
    ingredientName: 'Red Bell Pepper',
    substituteName: 'Yellow Bell Pepper',
    ratio: '1.00',
    notes: '1:1 substitution',
  },

  // Broth/Stock substitutions
  {
    ingredientName: 'Chicken Broth',
    substituteName: 'Chicken Stock',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Chicken Broth',
    substituteName: 'Vegetable Broth',
    ratio: '1.00',
    notes: 'Vegetarian option',
  },
  {
    ingredientName: 'Beef Broth',
    substituteName: 'Beef Stock',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Beef Broth',
    substituteName: 'Vegetable Broth',
    ratio: '1.00',
    notes: 'Vegetarian option',
  },
  {
    ingredientName: 'Vegetable Broth',
    substituteName: 'Vegetable Stock',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Chicken Stock',
    substituteName: 'Vegetable Stock',
    ratio: '1.00',
    notes: 'Vegetarian option',
  },

  // Vinegar substitutions
  {
    ingredientName: 'Apple Cider Vinegar',
    substituteName: 'White Vinegar',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Red Wine Vinegar',
    substituteName: 'White Wine Vinegar',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Red Wine Vinegar',
    substituteName: 'Balsamic Vinegar',
    ratio: '1.00',
    notes: 'Sweeter flavor',
  },

  // Rice substitutions
  {
    ingredientName: 'White Rice',
    substituteName: 'Brown Rice',
    ratio: '1.00',
    notes: 'Longer cooking time, nuttier flavor',
  },
  {
    ingredientName: 'White Rice',
    substituteName: 'Jasmine Rice',
    ratio: '1.00',
    notes: 'More fragrant',
  },
  {
    ingredientName: 'White Rice',
    substituteName: 'Basmati Rice',
    ratio: '1.00',
    notes: 'More fragrant, fluffier',
  },
  {
    ingredientName: 'Jasmine Rice',
    substituteName: 'Basmati Rice',
    ratio: '1.00',
    notes: '1:1 substitution',
  },

  // Tomato product substitutions
  {
    ingredientName: 'Tomato Sauce',
    substituteName: 'Crushed Tomatoes',
    ratio: '1.00',
    notes: 'More chunky',
  },
  {
    ingredientName: 'Crushed Tomatoes',
    substituteName: 'Diced Tomatoes',
    ratio: '1.00',
    notes: 'More chunky',
  },
  {
    ingredientName: 'Tomato Paste',
    substituteName: 'Tomato Sauce',
    ratio: '3.00',
    notes: '1 tbsp paste = 3 tbsp sauce (reduce liquid)',
  },

  // Mustard substitutions
  {
    ingredientName: 'Dijon Mustard',
    substituteName: 'Yellow Mustard',
    ratio: '1.00',
    notes: 'Less refined flavor',
  },
  {
    ingredientName: 'Yellow Mustard',
    substituteName: 'Dijon Mustard',
    ratio: '1.00',
    notes: 'More refined flavor',
  },

  // Nut butter substitutions
  {
    ingredientName: 'Peanut Butter',
    substituteName: 'Almond Butter',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Almond Butter',
    substituteName: 'Peanut Butter',
    ratio: '1.00',
    notes: '1:1 substitution',
  },

  // Meat substitutions (within same category)
  {
    ingredientName: 'Ground Beef',
    substituteName: 'Ground Turkey',
    ratio: '1.00',
    notes: 'Leaner option',
  },
  {
    ingredientName: 'Ground Beef',
    substituteName: 'Ground Pork',
    ratio: '1.00',
    notes: 'Fattier option',
  },
  {
    ingredientName: 'Ground Turkey',
    substituteName: 'Ground Chicken',
    ratio: '1.00',
    notes: '1:1 substitution',
  },
  {
    ingredientName: 'Chicken Breast',
    substituteName: 'Chicken Thighs',
    ratio: '1.00',
    notes: 'More flavorful, less dry',
  },

  // Breadcrumb alternatives
  {
    ingredientName: 'Bread',
    substituteName: 'Tortillas',
    ratio: '1.00',
    notes: 'For wraps and sandwiches',
  },
  {
    ingredientName: 'Flour Tortillas',
    substituteName: 'Corn Tortillas',
    ratio: '1.00',
    notes: 'Gluten-free option',
  },
];
