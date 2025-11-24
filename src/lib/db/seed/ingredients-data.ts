/**
 * Common ingredients seed data - 1000+ ingredients
 * Organized by category with common units for each ingredient
 */

export interface SeedIngredient {
  name: string;
  category:
    | 'produce'
    | 'dairy'
    | 'meat'
    | 'seafood'
    | 'pantry'
    | 'frozen'
    | 'bakery'
    | 'other';
  commonUnits: string[];
}

export const seedIngredients: SeedIngredient[] = [
  // PRODUCE - Vegetables
  { name: 'Onion', category: 'produce', commonUnits: ['whole', 'cup', 'tbsp'] },
  {
    name: 'Yellow Onion',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Red Onion',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'White Onion',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Sweet Onion',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Pearl Onions',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Shallots',
    category: 'produce',
    commonUnits: ['whole', 'tbsp', 'tsp'],
  },
  {
    name: 'Green Onions',
    category: 'produce',
    commonUnits: ['stalk', 'cup', 'bunch'],
  },
  {
    name: 'Scallions',
    category: 'produce',
    commonUnits: ['stalk', 'cup', 'bunch'],
  },
  { name: 'Leeks', category: 'produce', commonUnits: ['whole', 'cup', 'tbsp'] },
  {
    name: 'Garlic',
    category: 'produce',
    commonUnits: ['clove', 'tbsp', 'tsp'],
  },
  {
    name: 'Garlic Bulb',
    category: 'produce',
    commonUnits: ['whole', 'tbsp', 'cup'],
  },
  {
    name: 'Ginger Root',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'inch'],
  },
  {
    name: 'Fresh Ginger',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'piece'],
  },
  {
    name: 'Turmeric Root',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'piece'],
  },
  {
    name: 'Galangal',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'inch'],
  },
  { name: 'Tomato', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Roma Tomato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Cherry Tomato',
    category: 'produce',
    commonUnits: ['cup', 'whole', 'oz'],
  },
  {
    name: 'Beefsteak Tomato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'slice'],
  },
  {
    name: 'Green Tomato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Sun-Dried Tomato',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Tomatillo',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Potato', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Russet Potato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Red Potato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'White Potato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Yukon Gold Potato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Fingerling Potato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Sweet Potato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Yam', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Carrot', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Baby Carrot',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Purple Carrot',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Celery', category: 'produce', commonUnits: ['stalk', 'cup', 'lb'] },
  {
    name: 'Celeriac',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Bell Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Red Bell Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Green Bell Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Yellow Bell Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Orange Bell Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Poblano Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Jalapeño',
    category: 'produce',
    commonUnits: ['whole', 'tbsp', 'tsp'],
  },
  {
    name: 'Serrano Pepper',
    category: 'produce',
    commonUnits: ['whole', 'tbsp', 'tsp'],
  },
  {
    name: 'Habanero',
    category: 'produce',
    commonUnits: ['whole', 'tsp', 'tbsp'],
  },
  {
    name: 'Thai Chili Pepper',
    category: 'produce',
    commonUnits: ['whole', 'tsp', 'tbsp'],
  },
  {
    name: 'Ghost Pepper',
    category: 'produce',
    commonUnits: ['whole', 'tsp', 'pinch'],
  },
  {
    name: 'Anaheim Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Banana Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Hungarian Wax Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  { name: 'Broccoli', category: 'produce', commonUnits: ['head', 'cup', 'lb'] },
  {
    name: 'Broccoli Crown',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Broccolini',
    category: 'produce',
    commonUnits: ['bunch', 'cup', 'oz'],
  },
  {
    name: 'Cauliflower',
    category: 'produce',
    commonUnits: ['head', 'cup', 'lb'],
  },
  {
    name: 'Cauliflower Crown',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Romanesco',
    category: 'produce',
    commonUnits: ['head', 'cup', 'oz'],
  },
  {
    name: 'Purple Cauliflower',
    category: 'produce',
    commonUnits: ['head', 'cup', 'oz'],
  },
  {
    name: 'Brussels Sprouts',
    category: 'produce',
    commonUnits: ['cup', 'lb', 'whole'],
  },
  { name: 'Cabbage', category: 'produce', commonUnits: ['head', 'cup', 'lb'] },
  {
    name: 'Green Cabbage',
    category: 'produce',
    commonUnits: ['head', 'cup', 'lb'],
  },
  {
    name: 'Red Cabbage',
    category: 'produce',
    commonUnits: ['head', 'cup', 'lb'],
  },
  {
    name: 'Napa Cabbage',
    category: 'produce',
    commonUnits: ['head', 'cup', 'lb'],
  },
  {
    name: 'Savoy Cabbage',
    category: 'produce',
    commonUnits: ['head', 'cup', 'lb'],
  },
  {
    name: 'Bok Choy',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Spinach',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'lb', 'bunch'],
  },
  {
    name: 'Fresh Spinach',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Baby Spinach',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Kale',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch', 'leaf'],
  },
  {
    name: 'Curly Kale',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Lacinato Kale',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Red Kale',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Collard Greens',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Mustard Greens',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Turnip Greens',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  { name: 'Lettuce', category: 'produce', commonUnits: ['head', 'cup', 'oz'] },
  {
    name: 'Romaine Lettuce',
    category: 'produce',
    commonUnits: ['head', 'cup', 'leaf'],
  },
  {
    name: 'Iceberg Lettuce',
    category: 'produce',
    commonUnits: ['head', 'cup', 'leaf'],
  },
  {
    name: 'Butterhead Lettuce',
    category: 'produce',
    commonUnits: ['head', 'cup', 'leaf'],
  },
  { name: 'Arugula', category: 'produce', commonUnits: ['cup', 'oz', 'bunch'] },
  {
    name: 'Watercress',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  { name: 'Microgreens', category: 'produce', commonUnits: ['cup', 'oz'] },
  { name: 'Endive', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  {
    name: 'Radicchio',
    category: 'produce',
    commonUnits: ['head', 'cup', 'oz'],
  },
  { name: 'Frisée', category: 'produce', commonUnits: ['head', 'cup', 'oz'] },
  {
    name: 'Cucumber',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'English Cucumber',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Pickling Cucumber',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Zucchini',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Yellow Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Pattypan Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Butternut Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Acorn Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Delicata Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Kabocha Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Spaghetti Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Eggplant',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Japanese Eggplant',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Okra', category: 'produce', commonUnits: ['cup', 'lb', 'whole'] },
  {
    name: 'Asparagus',
    category: 'produce',
    commonUnits: ['lb', 'bunch', 'spear'],
  },
  {
    name: 'Green Asparagus',
    category: 'produce',
    commonUnits: ['lb', 'bunch', 'spear'],
  },
  {
    name: 'White Asparagus',
    category: 'produce',
    commonUnits: ['lb', 'bunch', 'spear'],
  },
  {
    name: 'Artichoke',
    category: 'produce',
    commonUnits: ['whole', 'heart', 'cup'],
  },
  {
    name: 'Artichoke Heart',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Fennel',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'bulb'],
  },
  {
    name: 'Green Beans',
    category: 'produce',
    commonUnits: ['cup', 'lb', 'oz'],
  },
  {
    name: 'Haricot Vert',
    category: 'produce',
    commonUnits: ['cup', 'lb', 'oz'],
  },
  { name: 'Wax Beans', category: 'produce', commonUnits: ['cup', 'lb', 'oz'] },
  {
    name: 'Lima Beans',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'pod'],
  },
  {
    name: 'Fava Beans',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'pod'],
  },
  { name: 'Peas', category: 'produce', commonUnits: ['cup', 'oz', 'pod'] },
  {
    name: 'Sugar Snap Peas',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Snow Peas',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'English Peas',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'pod'],
  },
  { name: 'Corn', category: 'produce', commonUnits: ['ear', 'cup', 'lb'] },
  { name: 'Corn on the Cob', category: 'produce', commonUnits: ['ear', 'cup'] },
  {
    name: 'Corn Kernels',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'can'],
  },
  {
    name: 'Baby Corn',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  { name: 'Jicama', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Parsnip', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Turnip', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Rutabaga',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Radish',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'bunch'],
  },
  {
    name: 'Daikon Radish',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  { name: 'Beets', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Golden Beets',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Beet Greens',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Kohlrabi',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  { name: 'Mâche', category: 'produce', commonUnits: ['cup', 'oz', 'bunch'] },
  {
    name: 'Purslane',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  { name: 'Chard', category: 'produce', commonUnits: ['cup', 'oz', 'bunch'] },
  {
    name: 'Swiss Chard',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Rainbow Chard',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },

  // PRODUCE - Fruits
  { name: 'Apple', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Granny Smith Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Red Delicious Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Golden Delicious Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Gala Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Fuji Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Honeycrisp Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Pink Lady Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Braeburn Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Jonagold Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Cortland Apple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Pear', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Bartlett Pear',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Bosc Pear',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Anjou Pear',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Seckel Pear',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  { name: 'Banana', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  {
    name: 'Plantain',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Orange',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Naval Orange',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Valencia Orange',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Blood Orange',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  { name: 'Lemon', category: 'produce', commonUnits: ['whole', 'tbsp', 'tsp'] },
  { name: 'Lime', category: 'produce', commonUnits: ['whole', 'tbsp', 'tsp'] },
  {
    name: 'Persian Lime',
    category: 'produce',
    commonUnits: ['whole', 'tbsp', 'tsp'],
  },
  {
    name: 'Key Lime',
    category: 'produce',
    commonUnits: ['whole', 'tbsp', 'tsp'],
  },
  {
    name: 'Grapefruit',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'half'],
  },
  {
    name: 'Pink Grapefruit',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'half'],
  },
  {
    name: 'Tangerine',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Mandarin Orange',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  {
    name: 'Clementine',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Strawberry',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Blueberry',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Raspberry',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Blackberry',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Cranberry',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Gooseberry',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  { name: 'Currant', category: 'produce', commonUnits: ['cup', 'oz', 'whole'] },
  { name: 'Grape', category: 'produce', commonUnits: ['cup', 'oz', 'bunch'] },
  {
    name: 'Red Grapes',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Green Grapes',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Black Grapes',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'bunch'],
  },
  {
    name: 'Watermelon',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Cantaloupe',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Honeydew',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Peach', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Nectarine',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Plum', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  {
    name: 'Red Plum',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Black Plum',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  { name: 'Apricot', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  { name: 'Cherry', category: 'produce', commonUnits: ['cup', 'oz', 'whole'] },
  {
    name: 'Sweet Cherry',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Tart Cherry',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Pineapple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  { name: 'Mango', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  { name: 'Papaya', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  { name: 'Kiwi', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  {
    name: 'Kiwi Fruit',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Golden Kiwi',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Passion Fruit',
    category: 'produce',
    commonUnits: ['whole', 'tbsp', 'tsp'],
  },
  {
    name: 'Dragon Fruit',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  { name: 'Coconut', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  {
    name: 'Pomegranate',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'tbsp'],
  },
  { name: 'Guava', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  { name: 'Lychee', category: 'produce', commonUnits: ['cup', 'oz', 'whole'] },
  {
    name: 'Rambutan',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Star Fruit',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  { name: 'Figs', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  { name: 'Dates', category: 'produce', commonUnits: ['whole', 'cup', 'oz'] },
  { name: 'Prunes', category: 'produce', commonUnits: ['cup', 'oz', 'whole'] },
  { name: 'Raisins', category: 'produce', commonUnits: ['cup', 'oz', 'tbsp'] },
  {
    name: 'Dried Apricots',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Dried Cranberries',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Dried Blueberries',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Tamarind',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'paste'],
  },
  {
    name: 'Horseradish',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'piece'],
  },
  {
    name: 'Wasabi Root',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'piece'],
  },

  // PRODUCE - Herbs
  { name: 'Basil', category: 'produce', commonUnits: ['cup', 'tbsp', 'leaf'] },
  {
    name: 'Sweet Basil',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },
  {
    name: 'Thai Basil',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },
  {
    name: 'Purple Basil',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },
  { name: 'Oregano', category: 'produce', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Fresh Oregano',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },
  { name: 'Thyme', category: 'produce', commonUnits: ['cup', 'tbsp', 'sprig'] },
  {
    name: 'Lemon Thyme',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'sprig'],
  },
  {
    name: 'Parsley',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'bunch'],
  },
  {
    name: 'Flat-Leaf Parsley',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'bunch'],
  },
  {
    name: 'Curly Parsley',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'bunch'],
  },
  {
    name: 'Cilantro',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'bunch'],
  },
  {
    name: 'Coriander Leaf',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'bunch'],
  },
  { name: 'Mint', category: 'produce', commonUnits: ['cup', 'tbsp', 'leaf'] },
  {
    name: 'Peppermint',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },
  {
    name: 'Spearmint',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },
  {
    name: 'Rosemary',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'sprig'],
  },
  { name: 'Sage', category: 'produce', commonUnits: ['cup', 'tbsp', 'leaf'] },
  { name: 'Dill', category: 'produce', commonUnits: ['cup', 'tbsp', 'frond'] },
  {
    name: 'Tarragon',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },
  {
    name: 'Chives',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'blade'],
  },
  {
    name: 'Chervil',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },
  {
    name: 'Marjoram',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  { name: 'Lovage', category: 'produce', commonUnits: ['cup', 'tbsp', 'leaf'] },
  { name: 'Sorrel', category: 'produce', commonUnits: ['cup', 'tbsp', 'leaf'] },
  {
    name: 'Borage',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'flower'],
  },
  {
    name: 'Bay Leaf',
    category: 'produce',
    commonUnits: ['leaf', 'tbsp', 'tsp'],
  },
  {
    name: 'Epazote',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },
  {
    name: 'Moringa Leaves',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'leaf'],
  },

  // MEAT
  { name: 'Beef', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Ground Beef', category: 'meat', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Beef Chuck', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Beef Ribeye', category: 'meat', commonUnits: ['lb', 'oz', 'steak'] },
  {
    name: 'Beef Filet Mignon',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'steak'],
  },
  {
    name: 'Beef Sirloin',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'steak'],
  },
  {
    name: 'Beef NY Strip',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'steak'],
  },
  {
    name: 'Beef Tenderloin',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'roast'],
  },
  {
    name: 'Beef Brisket',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'whole'],
  },
  {
    name: 'Beef Short Ribs',
    category: 'meat',
    commonUnits: ['lb', 'cup', 'whole'],
  },
  {
    name: 'Beef Stew Meat',
    category: 'meat',
    commonUnits: ['lb', 'cup', 'piece'],
  },
  { name: 'Beef Liver', category: 'meat', commonUnits: ['lb', 'oz', 'slice'] },
  { name: 'Beef Heart', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Beef Tongue', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Beef Jerky', category: 'meat', commonUnits: ['oz', 'cup', 'piece'] },
  {
    name: 'Beef Ground Sirloin',
    category: 'meat',
    commonUnits: ['lb', 'cup', 'oz'],
  },
  {
    name: 'Beef Shank',
    category: 'meat',
    commonUnits: ['lb', 'whole', 'piece'],
  },
  {
    name: 'Beef Marrow Bones',
    category: 'meat',
    commonUnits: ['lb', 'bone', 'oz'],
  },

  { name: 'Pork', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Ground Pork', category: 'meat', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Pork Chops', category: 'meat', commonUnits: ['lb', 'oz', 'chop'] },
  {
    name: 'Pork Tenderloin',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'roast'],
  },
  {
    name: 'Pork Shoulder',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'roast'],
  },
  { name: 'Pork Butt', category: 'meat', commonUnits: ['lb', 'oz', 'roast'] },
  { name: 'Pork Ribs', category: 'meat', commonUnits: ['lb', 'cup', 'rack'] },
  { name: 'Pork Belly', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Bacon', category: 'meat', commonUnits: ['lb', 'slice', 'strip'] },
  { name: 'Pancetta', category: 'meat', commonUnits: ['oz', 'slice', 'cup'] },
  { name: 'Prosciutto', category: 'meat', commonUnits: ['oz', 'slice', 'lb'] },
  { name: 'Ham', category: 'meat', commonUnits: ['lb', 'oz', 'slice'] },
  { name: 'Pork Liver', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Pork Jowl', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  {
    name: 'Pork Feet',
    category: 'meat',
    commonUnits: ['lb', 'whole', 'piece'],
  },

  { name: 'Chicken', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Whole Chicken', category: 'meat', commonUnits: ['lb', 'whole'] },
  {
    name: 'Chicken Breast',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'breast'],
  },
  {
    name: 'Boneless Chicken Breast',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'breast'],
  },
  {
    name: 'Skinless Chicken Breast',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'breast'],
  },
  {
    name: 'Chicken Thigh',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'thigh'],
  },
  {
    name: 'Boneless Chicken Thigh',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'thigh'],
  },
  {
    name: 'Chicken Drumstick',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'leg'],
  },
  { name: 'Chicken Leg', category: 'meat', commonUnits: ['lb', 'oz', 'leg'] },
  { name: 'Chicken Wing', category: 'meat', commonUnits: ['lb', 'oz', 'wing'] },
  {
    name: 'Chicken Tenders',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'piece'],
  },
  {
    name: 'Ground Chicken',
    category: 'meat',
    commonUnits: ['lb', 'cup', 'oz'],
  },
  {
    name: 'Rotisserie Chicken',
    category: 'meat',
    commonUnits: ['whole', 'cup', 'oz'],
  },
  {
    name: 'Chicken Liver',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'piece'],
  },
  {
    name: 'Chicken Gizzards',
    category: 'meat',
    commonUnits: ['lb', 'cup', 'oz'],
  },
  {
    name: 'Chicken Hearts',
    category: 'meat',
    commonUnits: ['lb', 'cup', 'oz'],
  },

  { name: 'Turkey', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Whole Turkey', category: 'meat', commonUnits: ['lb', 'whole'] },
  {
    name: 'Turkey Breast',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'breast'],
  },
  { name: 'Ground Turkey', category: 'meat', commonUnits: ['lb', 'cup', 'oz'] },
  {
    name: 'Turkey Drumstick',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'leg'],
  },
  {
    name: 'Turkey Thigh',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'thigh'],
  },

  { name: 'Duck', category: 'meat', commonUnits: ['lb', 'whole', 'breast'] },
  {
    name: 'Duck Breast',
    category: 'meat',
    commonUnits: ['lb', 'breast', 'oz'],
  },
  { name: 'Ground Duck', category: 'meat', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Duck Legs', category: 'meat', commonUnits: ['lb', 'leg', 'oz'] },

  { name: 'Lamb', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Lamb Chops', category: 'meat', commonUnits: ['lb', 'oz', 'chop'] },
  { name: 'Lamb Leg', category: 'meat', commonUnits: ['lb', 'oz', 'roast'] },
  {
    name: 'Lamb Shoulder',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'roast'],
  },
  { name: 'Ground Lamb', category: 'meat', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Lamb Shanks', category: 'meat', commonUnits: ['lb', 'shank', 'oz'] },
  { name: 'Lamb Liver', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Lamb Ribs', category: 'meat', commonUnits: ['lb', 'rack', 'oz'] },

  { name: 'Veal', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Veal Chops', category: 'meat', commonUnits: ['lb', 'oz', 'chop'] },
  {
    name: 'Veal Cutlet',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'cutlet'],
  },
  { name: 'Ground Veal', category: 'meat', commonUnits: ['lb', 'cup', 'oz'] },

  { name: 'Sausage', category: 'meat', commonUnits: ['lb', 'link', 'oz'] },
  {
    name: 'Italian Sausage',
    category: 'meat',
    commonUnits: ['lb', 'link', 'oz'],
  },
  { name: 'Bratwurst', category: 'meat', commonUnits: ['lb', 'link', 'oz'] },
  { name: 'Chorizo', category: 'meat', commonUnits: ['lb', 'link', 'oz'] },
  {
    name: 'Andouille Sausage',
    category: 'meat',
    commonUnits: ['lb', 'link', 'oz'],
  },
  { name: 'Kielbasa', category: 'meat', commonUnits: ['lb', 'slice', 'oz'] },
  { name: 'Merguez', category: 'meat', commonUnits: ['lb', 'link', 'oz'] },
  { name: 'Pepperoni', category: 'meat', commonUnits: ['lb', 'slice', 'oz'] },
  { name: 'Mortadella', category: 'meat', commonUnits: ['oz', 'slice', 'lb'] },
  { name: 'Guanciale', category: 'meat', commonUnits: ['oz', 'slice', 'lb'] },

  { name: 'Goat', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Ground Goat', category: 'meat', commonUnits: ['lb', 'cup', 'oz'] },

  { name: 'Rabbit', category: 'meat', commonUnits: ['lb', 'whole', 'piece'] },
  { name: 'Venison', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  {
    name: 'Ground Venison',
    category: 'meat',
    commonUnits: ['lb', 'cup', 'oz'],
  },
  { name: 'Elk', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  { name: 'Bison', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },

  // SEAFOOD
  { name: 'Salmon', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  {
    name: 'Salmon Fillet',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz'],
  },
  {
    name: 'Salmon Steak',
    category: 'seafood',
    commonUnits: ['lb', 'steak', 'oz'],
  },
  {
    name: 'Wild Salmon',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz'],
  },
  {
    name: 'Farmed Salmon',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz'],
  },

  { name: 'Cod', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  { name: 'Halibut', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  {
    name: 'Flounder',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz'],
  },
  { name: 'Sole', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  { name: 'Tilapia', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  { name: 'Snapper', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  {
    name: 'Mahi Mahi',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz'],
  },
  { name: 'Pollock', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  { name: 'Haddock', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  {
    name: 'Branzino',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'whole'],
  },
  { name: 'Bass', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  {
    name: 'Sea Bass',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz'],
  },
  { name: 'Grouper', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },

  {
    name: 'Tuna',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz', 'can'],
  },
  { name: 'Ahi Tuna', category: 'seafood', commonUnits: ['lb', 'steak', 'oz'] },
  {
    name: 'Yellowfin Tuna',
    category: 'seafood',
    commonUnits: ['lb', 'steak', 'oz'],
  },
  {
    name: 'Albacore Tuna',
    category: 'seafood',
    commonUnits: ['can', 'oz', 'lb'],
  },
  {
    name: 'Bluefin Tuna',
    category: 'seafood',
    commonUnits: ['lb', 'steak', 'oz'],
  },
  {
    name: 'Canned Tuna',
    category: 'seafood',
    commonUnits: ['can', 'oz', 'cup'],
  },

  {
    name: 'Mackerel',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz'],
  },
  {
    name: 'Sardines',
    category: 'seafood',
    commonUnits: ['can', 'oz', 'whole'],
  },
  { name: 'Herring', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  {
    name: 'Anchovies',
    category: 'seafood',
    commonUnits: ['can', 'oz', 'whole'],
  },
  {
    name: 'Trout',
    category: 'seafood',
    commonUnits: ['lb', 'whole', 'fillet'],
  },
  { name: 'Catfish', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  {
    name: 'Swordfish',
    category: 'seafood',
    commonUnits: ['lb', 'steak', 'oz'],
  },
  { name: 'Shark', category: 'seafood', commonUnits: ['lb', 'steak', 'oz'] },
  {
    name: 'Yellowtail',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz'],
  },
  { name: 'Escolar', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  { name: 'Wahoo', category: 'seafood', commonUnits: ['lb', 'fillet', 'oz'] },
  {
    name: 'Kingfish',
    category: 'seafood',
    commonUnits: ['lb', 'fillet', 'oz'],
  },

  { name: 'Shrimp', category: 'seafood', commonUnits: ['lb', 'cup', 'oz'] },
  {
    name: 'Large Shrimp',
    category: 'seafood',
    commonUnits: ['lb', 'cup', 'oz'],
  },
  {
    name: 'Jumbo Shrimp',
    category: 'seafood',
    commonUnits: ['lb', 'cup', 'oz'],
  },
  { name: 'Prawns', category: 'seafood', commonUnits: ['lb', 'cup', 'oz'] },
  {
    name: 'Tiger Shrimp',
    category: 'seafood',
    commonUnits: ['lb', 'cup', 'oz'],
  },
  {
    name: 'Rock Shrimp',
    category: 'seafood',
    commonUnits: ['lb', 'cup', 'oz'],
  },

  { name: 'Crab', category: 'seafood', commonUnits: ['lb', 'cup', 'whole'] },
  { name: 'Crab Meat', category: 'seafood', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Crab Cakes',
    category: 'seafood',
    commonUnits: ['whole', 'oz', 'lb'],
  },
  {
    name: 'Dungeness Crab',
    category: 'seafood',
    commonUnits: ['lb', 'whole', 'oz'],
  },
  {
    name: 'Blue Crab',
    category: 'seafood',
    commonUnits: ['lb', 'whole', 'oz'],
  },
  { name: 'King Crab', category: 'seafood', commonUnits: ['lb', 'leg', 'oz'] },

  {
    name: 'Lobster',
    category: 'seafood',
    commonUnits: ['lb', 'whole', 'tail'],
  },
  {
    name: 'Lobster Tail',
    category: 'seafood',
    commonUnits: ['whole', 'oz', 'lb'],
  },
  {
    name: 'Lobster Meat',
    category: 'seafood',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  { name: 'Crawfish', category: 'seafood', commonUnits: ['lb', 'whole', 'oz'] },

  { name: 'Mussels', category: 'seafood', commonUnits: ['lb', 'cup', 'whole'] },
  { name: 'Clams', category: 'seafood', commonUnits: ['lb', 'cup', 'whole'] },
  { name: 'Oysters', category: 'seafood', commonUnits: ['lb', 'cup', 'whole'] },
  {
    name: 'Scallops',
    category: 'seafood',
    commonUnits: ['lb', 'cup', 'whole'],
  },
  {
    name: 'Bay Scallops',
    category: 'seafood',
    commonUnits: ['lb', 'cup', 'whole'],
  },
  {
    name: 'Sea Scallops',
    category: 'seafood',
    commonUnits: ['lb', 'cup', 'whole'],
  },
  { name: 'Cockles', category: 'seafood', commonUnits: ['lb', 'cup', 'whole'] },

  { name: 'Squid', category: 'seafood', commonUnits: ['lb', 'cup', 'whole'] },
  { name: 'Octopus', category: 'seafood', commonUnits: ['lb', 'cup', 'whole'] },
  {
    name: 'Cuttlefish',
    category: 'seafood',
    commonUnits: ['lb', 'cup', 'whole'],
  },

  {
    name: 'Sea Urchin',
    category: 'seafood',
    commonUnits: ['oz', 'cup', 'whole'],
  },
  {
    name: 'Sea Cucumber',
    category: 'seafood',
    commonUnits: ['lb', 'oz', 'whole'],
  },

  // DAIRY
  { name: 'Milk', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  { name: 'Whole Milk', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  { name: 'Skim Milk', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  {
    name: 'Low-Fat Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: '2% Milk', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  { name: 'Buttermilk', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  {
    name: 'Evaporated Milk',
    category: 'dairy',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Sweetened Condensed Milk',
    category: 'dairy',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Almond Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'Oat Milk', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  { name: 'Soy Milk', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  {
    name: 'Coconut Milk',
    category: 'dairy',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Cashew Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'Rice Milk', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },

  { name: 'Cream', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  {
    name: 'Heavy Cream',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Whipping Cream',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'Sour Cream', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  {
    name: 'Crème Fraîche',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Greek Yogurt',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },

  { name: 'Butter', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  {
    name: 'Unsalted Butter',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Salted Butter',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Clarified Butter',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'Ghee', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  {
    name: 'Browned Butter',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },

  {
    name: 'Cheddar Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Sharp Cheddar',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Extra Sharp Cheddar',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Mozzarella Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Fresh Mozzarella',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'ball'],
  },
  {
    name: 'Low Moisture Mozzarella',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Parmesan Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Parmigiano Reggiano',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Grana Padano',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Swiss Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Gruyère Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Emmental Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Edam Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Gouda Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Provolone Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Fontina Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Havarti Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Muenster Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Jack Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Pepper Jack Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Monterey Jack',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Oaxaca Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Brie Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Camembert Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Goat Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  { name: 'Chèvre', category: 'dairy', commonUnits: ['cup', 'oz', 'tbsp'] },
  {
    name: 'Feta Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Blue Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Gorgonzola Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Roquefort Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Stilton Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Cotija Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Queso Fresco',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Halloumi Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Ricotta Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Mascarpone Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Cream Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Neufchâtel Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Boursin Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Raclette Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Taleggio Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Reblochon Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Époisses Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Limburger Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Washed-Rind Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },

  { name: 'Yogurt', category: 'dairy', commonUnits: ['cup', 'oz', 'tbsp'] },
  {
    name: 'Plain Yogurt',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Flavored Yogurt',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  { name: 'Skyr', category: 'dairy', commonUnits: ['cup', 'oz', 'tbsp'] },
  { name: 'Kefir', category: 'dairy', commonUnits: ['cup', 'oz', 'tbsp'] },
  { name: 'Labneh', category: 'dairy', commonUnits: ['cup', 'oz', 'tbsp'] },

  { name: 'Eggs', category: 'dairy', commonUnits: ['whole', 'cup', 'oz'] },
  { name: 'Egg Whites', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  { name: 'Egg Yolks', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  { name: 'Duck Eggs', category: 'dairy', commonUnits: ['whole', 'cup', 'oz'] },
  {
    name: 'Quail Eggs',
    category: 'dairy',
    commonUnits: ['whole', 'cup', 'oz'],
  },

  // PANTRY - Spices & Seasonings
  { name: 'Salt', category: 'pantry', commonUnits: ['tsp', 'tbsp', 'cup'] },
  { name: 'Sea Salt', category: 'pantry', commonUnits: ['tsp', 'tbsp', 'cup'] },
  {
    name: 'Kosher Salt',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Himalayan Pink Salt',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Black Salt',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Black Pepper',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'White Pepper',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Pink Peppercorns',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Green Peppercorns',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Tellicherry Pepper',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Cayenne Pepper',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Red Pepper Flakes',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Chili Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Ancho Chili Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Chipotle Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  { name: 'Paprika', category: 'pantry', commonUnits: ['tsp', 'tbsp', 'cup'] },
  {
    name: 'Smoked Paprika',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Sweet Paprika',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Hot Paprika',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Garlic Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Garlic Salt',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Onion Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Onion Salt',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Ginger Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Turmeric Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  { name: 'Cumin', category: 'pantry', commonUnits: ['tsp', 'tbsp', 'cup'] },
  {
    name: 'Ground Cumin',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Coriander',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Ground Coriander',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Fenugreek',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Fennel Seeds',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Caraway Seeds',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Mustard Seeds',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Celery Seeds',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Poppy Seeds',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Sesame Seeds',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Black Sesame Seeds',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Nigella Seeds',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Anise Seeds',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Star Anise',
    category: 'pantry',
    commonUnits: ['whole', 'tsp', 'tbsp'],
  },
  {
    name: 'Cinnamon',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup', 'stick'],
  },
  {
    name: 'Cassia Cinnamon',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'stick'],
  },
  {
    name: 'Ceylon Cinnamon',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'stick'],
  },
  { name: 'Nutmeg', category: 'pantry', commonUnits: ['tsp', 'tbsp', 'pinch'] },
  { name: 'Mace', category: 'pantry', commonUnits: ['tsp', 'tbsp', 'cup'] },
  { name: 'Cloves', category: 'pantry', commonUnits: ['whole', 'tsp', 'tbsp'] },
  { name: 'Allspice', category: 'pantry', commonUnits: ['tsp', 'tbsp', 'cup'] },
  { name: 'Cardamom', category: 'pantry', commonUnits: ['pod', 'tsp', 'tbsp'] },
  {
    name: 'Cardamom Seed',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Saffron',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'strand'],
  },
  {
    name: 'Juniper Berries',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  { name: 'Sumac', category: 'pantry', commonUnits: ['tsp', 'tbsp', 'cup'] },
  {
    name: 'Asafoetida',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
  },
  {
    name: 'Vanilla Extract',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Vanilla Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Vanilla Bean',
    category: 'pantry',
    commonUnits: ['whole', 'tbsp', 'tsp'],
  },
  {
    name: 'Almond Extract',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Peppermint Extract',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Lemon Zest',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Lime Zest',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Orange Zest',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Lemongrass',
    category: 'pantry',
    commonUnits: ['stalk', 'tbsp', 'cup'],
  },

  // PANTRY - Condiments
  {
    name: 'Mayonnaise',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  { name: 'Ketchup', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  { name: 'Mustard', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Yellow Mustard',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Dijon Mustard',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Whole Grain Mustard',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Spicy Brown Mustard',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Soy Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  { name: 'Tamari', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Coconut Aminos',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Worcestershire Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Fish Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Oyster Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Hoisin Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Teriyaki Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Hot Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  { name: 'Sriracha', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Tabasco Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: "Frank's RedHot Sauce",
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Chili Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  { name: 'Salsa', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tbsp'] },
  {
    name: 'Pico de Gallo',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tbsp'],
  },
  {
    name: 'Marinara Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'can'],
  },
  {
    name: 'Tomato Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'can'],
  },
  {
    name: 'Tomato Paste',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'can'],
  },
  {
    name: 'Tomato Puree',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  { name: 'Pesto', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Alfredo Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'Hummus', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  { name: 'Tahini', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Miso Paste',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Gochujang',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Gochugaru',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'BBQ Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Barbecue Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Mole Sauce',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'HP Sauce', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  { name: 'A1 Sauce', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  { name: 'Honey', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Raw Honey',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Maple Syrup',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Agave Nectar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Brown Rice Syrup',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  { name: 'Molasses', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Blackstrap Molasses',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },

  // PANTRY - Oils & Vinegars
  {
    name: 'Olive Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Extra Virgin Olive Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Virgin Olive Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Pure Olive Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Light Olive Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Vegetable Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Canola Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Sunflower Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Safflower Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  { name: 'Corn Oil', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Soybean Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Peanut Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Sesame Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Coconut Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Avocado Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Walnut Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Almond Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Grapeseed Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Hazelnut Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Macadamia Oil',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },

  {
    name: 'Balsamic Vinegar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Red Wine Vinegar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'White Wine Vinegar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Distilled White Vinegar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Apple Cider Vinegar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Rice Vinegar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Sherry Vinegar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Malt Vinegar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Champagne Vinegar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },

  // PANTRY - Dry Goods & Flours
  {
    name: 'All-Purpose Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Bread Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Cake Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Pastry Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Whole Wheat Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Whole Spelt Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'Rye Flour', category: 'pantry', commonUnits: ['cup', 'tbsp', 'oz'] },
  {
    name: 'Almond Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Coconut Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Chickpea Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'Cornmeal', category: 'pantry', commonUnits: ['cup', 'tbsp', 'oz'] },
  { name: 'Polenta', category: 'pantry', commonUnits: ['cup', 'tbsp', 'oz'] },
  {
    name: 'Rice Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Tapioca Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Potato Starch',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
  },
  {
    name: 'Cornstarch',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
  },
  {
    name: 'Arrowroot Powder',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
  },
  {
    name: 'Tapioca Starch',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
  },
  {
    name: 'Gluten-Free Flour Blend',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },

  // PANTRY - Sugars
  {
    name: 'Granulated Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Brown Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Dark Brown Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Light Brown Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Muscovado Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Demerara Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Turbinado Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Confectioners Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Powdered Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Coconut Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Date Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Cane Juice Crystals',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Stevia',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'packet'],
  },
  {
    name: 'Monk Fruit Sweetener',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'packet'],
  },
  {
    name: 'Erythritol',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },

  // PANTRY - Leavening
  {
    name: 'Baking Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Baking Soda',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'cup'],
  },
  {
    name: 'Active Dry Yeast',
    category: 'pantry',
    commonUnits: ['packet', 'tsp', 'tbsp'],
  },
  {
    name: 'Instant Yeast',
    category: 'pantry',
    commonUnits: ['packet', 'tsp', 'tbsp'],
  },
  {
    name: 'Bread Yeast',
    category: 'pantry',
    commonUnits: ['packet', 'tsp', 'tbsp'],
  },
  {
    name: 'Rapid Rise Yeast',
    category: 'pantry',
    commonUnits: ['packet', 'tsp', 'tbsp'],
  },

  // PANTRY - Pasta & Grains
  { name: 'Spaghetti', category: 'pantry', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Penne', category: 'pantry', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Fusilli', category: 'pantry', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Linguine', category: 'pantry', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Fettuccine', category: 'pantry', commonUnits: ['lb', 'cup', 'oz'] },
  {
    name: 'Lasagna Noodles',
    category: 'pantry',
    commonUnits: ['lb', 'cup', 'oz'],
  },
  { name: 'Ravioli', category: 'pantry', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Tortellini', category: 'pantry', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Orzo', category: 'pantry', commonUnits: ['lb', 'cup', 'oz'] },
  { name: 'Couscous', category: 'pantry', commonUnits: ['cup', 'oz', 'tbsp'] },
  {
    name: 'Pearl Couscous',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Israeli Couscous',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },

  { name: 'White Rice', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Brown Rice', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Basmati Rice',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Jasmine Rice',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Arborio Rice',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Carnaroli Rice',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  { name: 'Wild Rice', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Short-Grain Rice',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Long-Grain Rice',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  { name: 'Black Rice', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Red Rice', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Purple Rice', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Sushi Rice', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },

  { name: 'Quinoa', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Millet', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Farro', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Barley', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Oats', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Rolled Oats', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Steel-Cut Oats',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Old-Fashioned Oats',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Instant Oats',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'packet'],
  },
  { name: 'Buckwheat', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Kasha', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },

  // PANTRY - Legumes
  { name: 'Lentils', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Red Lentils', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Green Lentils',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'French Lentils',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Black Lentils',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Beluga Lentils',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },

  { name: 'Chickpeas', category: 'pantry', commonUnits: ['cup', 'can', 'oz'] },
  {
    name: 'Black Beans',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Kidney Beans',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Pinto Beans',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'White Beans',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Great Northern Beans',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  { name: 'Navy Beans', category: 'pantry', commonUnits: ['cup', 'can', 'oz'] },
  {
    name: 'Cannellini Beans',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Black-Eyed Peas',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Borlotti Beans',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Cranberry Beans',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  { name: 'Fava Beans', category: 'pantry', commonUnits: ['cup', 'can', 'oz'] },
  { name: 'Lima Beans', category: 'pantry', commonUnits: ['cup', 'can', 'oz'] },
  { name: 'Split Peas', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Yellow Split Peas',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Green Split Peas',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },

  // PANTRY - Nuts & Seeds
  { name: 'Almonds', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Sliced Almonds',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Slivered Almonds',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Blanched Almonds',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  { name: 'Raw Almonds', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Roasted Almonds',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Marcona Almonds',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },

  { name: 'Walnuts', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Black Walnuts',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },

  { name: 'Pecans', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Candied Pecans',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },

  { name: 'Cashews', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Raw Cashews', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Roasted Cashews',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },

  {
    name: 'Macadamia Nuts',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  { name: 'Brazil Nuts', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Pine Nuts', category: 'pantry', commonUnits: ['cup', 'oz', 'tbsp'] },
  { name: 'Peanuts', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Spanish Peanuts',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  {
    name: 'Virginia Peanuts',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'lb'],
  },
  { name: 'Pistachios', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Hazelnuts', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  {
    name: 'Sunflower Seeds',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Pumpkin Seeds',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Chia Seeds',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  { name: 'Flaxseeds', category: 'pantry', commonUnits: ['cup', 'oz', 'tbsp'] },
  {
    name: 'Hemp Seeds',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },

  {
    name: 'Peanut Butter',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Almond Butter',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Sunflower Seed Butter',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Cashew Butter',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Hazelnut Spread',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  { name: 'Tahini', category: 'pantry', commonUnits: ['cup', 'tbsp', 'tsp'] },

  // PANTRY - Canned/Packaged
  {
    name: 'Canned Tomatoes',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Diced Tomatoes',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Crushed Tomatoes',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Whole Peeled Tomatoes',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Tomato Sauce',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },

  {
    name: 'Canned Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Chickpeas',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Black Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Kidney Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Pinto Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned White Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },

  {
    name: 'Canned Corn',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Peas',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Green Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Carrots',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },

  {
    name: 'Canned Pineapple',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Peaches',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Pears',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Mandarin Oranges',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },

  {
    name: 'Canned Tuna',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Salmon',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Canned Sardines',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },

  { name: 'Broth', category: 'pantry', commonUnits: ['cup', 'can', 'oz'] },
  {
    name: 'Chicken Broth',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  { name: 'Beef Broth', category: 'pantry', commonUnits: ['cup', 'can', 'oz'] },
  {
    name: 'Vegetable Broth',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  { name: 'Fish Stock', category: 'pantry', commonUnits: ['cup', 'can', 'oz'] },

  {
    name: 'Coconut Milk',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Light Coconut Milk',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Full-Fat Coconut Milk',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },

  {
    name: 'Vegetable Juice',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Tomato Juice',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  { name: 'Clam Juice', category: 'pantry', commonUnits: ['cup', 'can', 'oz'] },

  // BAKERY
  { name: 'Bread', category: 'bakery', commonUnits: ['slice', 'loaf', 'oz'] },
  {
    name: 'White Bread',
    category: 'bakery',
    commonUnits: ['slice', 'loaf', 'oz'],
  },
  {
    name: 'Whole Wheat Bread',
    category: 'bakery',
    commonUnits: ['slice', 'loaf', 'oz'],
  },
  {
    name: 'Whole Grain Bread',
    category: 'bakery',
    commonUnits: ['slice', 'loaf', 'oz'],
  },
  {
    name: 'Sourdough Bread',
    category: 'bakery',
    commonUnits: ['slice', 'loaf', 'oz'],
  },
  {
    name: 'Rye Bread',
    category: 'bakery',
    commonUnits: ['slice', 'loaf', 'oz'],
  },
  {
    name: 'Pumpernickel Bread',
    category: 'bakery',
    commonUnits: ['slice', 'loaf', 'oz'],
  },
  {
    name: 'Ciabatta',
    category: 'bakery',
    commonUnits: ['whole', 'slice', 'oz'],
  },
  {
    name: 'Focaccia',
    category: 'bakery',
    commonUnits: ['slice', 'whole', 'oz'],
  },
  {
    name: 'Flatbread',
    category: 'bakery',
    commonUnits: ['whole', 'oz', 'piece'],
  },
  {
    name: 'Pita Bread',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  { name: 'Naan', category: 'bakery', commonUnits: ['whole', 'piece', 'oz'] },
  {
    name: 'Baguette',
    category: 'bakery',
    commonUnits: ['whole', 'slice', 'oz'],
  },
  {
    name: 'Rolls',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'Dinner Rolls',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'Hamburger Buns',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'Hot Dog Buns',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'Sub Rolls',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'Bagels',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'English Muffins',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'Croissants',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'Tortillas',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'Flour Tortillas',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },
  {
    name: 'Corn Tortillas',
    category: 'bakery',
    commonUnits: ['whole', 'package', 'oz'],
  },

  // FROZEN
  {
    name: 'Frozen Peas',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Corn',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Green Beans',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Mixed Vegetables',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Broccoli',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Cauliflower',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Spinach',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Strawberries',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Blueberries',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Raspberries',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Blackberries',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Mixed Berries',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Mango',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Frozen Pineapple',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  {
    name: 'Ice Cream',
    category: 'frozen',
    commonUnits: ['pint', 'cup', 'scoop'],
  },
  {
    name: 'Vanilla Ice Cream',
    category: 'frozen',
    commonUnits: ['pint', 'cup', 'scoop'],
  },
  {
    name: 'Chocolate Ice Cream',
    category: 'frozen',
    commonUnits: ['pint', 'cup', 'scoop'],
  },
  {
    name: 'Strawberry Ice Cream',
    category: 'frozen',
    commonUnits: ['pint', 'cup', 'scoop'],
  },
  {
    name: 'Frozen Yogurt',
    category: 'frozen',
    commonUnits: ['pint', 'cup', 'scoop'],
  },
  {
    name: 'Frozen Fruit Bars',
    category: 'frozen',
    commonUnits: ['whole', 'oz', 'lb'],
  },
  {
    name: 'Popsicles',
    category: 'frozen',
    commonUnits: ['whole', 'box', 'oz'],
  },

  // OTHER
  {
    name: 'Water',
    category: 'other',
    commonUnits: ['cup', 'tbsp', 'tsp', 'oz'],
  },
  { name: 'Coffee', category: 'other', commonUnits: ['cup', 'tbsp', 'tsp'] },
  {
    name: 'Ground Coffee',
    category: 'other',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'Espresso', category: 'other', commonUnits: ['shot', 'cup', 'tbsp'] },
  { name: 'Tea', category: 'other', commonUnits: ['bag', 'cup', 'tsp'] },
  { name: 'Black Tea', category: 'other', commonUnits: ['bag', 'cup', 'tsp'] },
  { name: 'Green Tea', category: 'other', commonUnits: ['bag', 'cup', 'tsp'] },
  { name: 'Herbal Tea', category: 'other', commonUnits: ['bag', 'cup', 'tsp'] },
  { name: 'Matcha', category: 'other', commonUnits: ['tbsp', 'tsp', 'powder'] },
  { name: 'Wine', category: 'other', commonUnits: ['cup', 'bottle', 'glass'] },
  {
    name: 'Red Wine',
    category: 'other',
    commonUnits: ['cup', 'bottle', 'glass'],
  },
  {
    name: 'White Wine',
    category: 'other',
    commonUnits: ['cup', 'bottle', 'glass'],
  },
  {
    name: 'Rosé Wine',
    category: 'other',
    commonUnits: ['cup', 'bottle', 'glass'],
  },
  {
    name: 'Sparkling Wine',
    category: 'other',
    commonUnits: ['cup', 'bottle', 'glass'],
  },
  {
    name: 'Champagne',
    category: 'other',
    commonUnits: ['cup', 'bottle', 'glass'],
  },
  { name: 'Beer', category: 'other', commonUnits: ['bottle', 'can', 'cup'] },
  { name: 'Lager', category: 'other', commonUnits: ['bottle', 'can', 'cup'] },
  { name: 'IPA', category: 'other', commonUnits: ['bottle', 'can', 'cup'] },
  { name: 'Stout', category: 'other', commonUnits: ['bottle', 'can', 'cup'] },
  { name: 'Vodka', category: 'other', commonUnits: ['cup', 'tbsp', 'shot'] },
  { name: 'Rum', category: 'other', commonUnits: ['cup', 'tbsp', 'shot'] },
  { name: 'Gin', category: 'other', commonUnits: ['cup', 'tbsp', 'shot'] },
  { name: 'Whiskey', category: 'other', commonUnits: ['cup', 'tbsp', 'shot'] },
  { name: 'Tequila', category: 'other', commonUnits: ['cup', 'tbsp', 'shot'] },
  { name: 'Brandy', category: 'other', commonUnits: ['cup', 'tbsp', 'shot'] },
  { name: 'Cognac', category: 'other', commonUnits: ['cup', 'tbsp', 'shot'] },
];
