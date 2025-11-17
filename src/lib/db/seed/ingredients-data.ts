/**
 * Common ingredients seed data
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
    name: 'Garlic',
    category: 'produce',
    commonUnits: ['clove', 'tbsp', 'tsp'],
  },
  { name: 'Tomato', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Potato', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Sweet Potato',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Carrot', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Celery', category: 'produce', commonUnits: ['stalk', 'cup', 'lb'] },
  {
    name: 'Bell Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Red Bell Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup'],
  },
  {
    name: 'Green Bell Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup'],
  },
  {
    name: 'Yellow Bell Pepper',
    category: 'produce',
    commonUnits: ['whole', 'cup'],
  },
  {
    name: 'Jalapeño',
    category: 'produce',
    commonUnits: ['whole', 'tbsp', 'tsp'],
  },
  {
    name: 'Serrano Pepper',
    category: 'produce',
    commonUnits: ['whole', 'tbsp'],
  },
  {
    name: 'Habanero',
    category: 'produce',
    commonUnits: ['whole', 'tsp', 'tbsp'],
  },
  {
    name: 'Broccoli',
    category: 'produce',
    commonUnits: ['head', 'cup', 'lb'],
  },
  {
    name: 'Cauliflower',
    category: 'produce',
    commonUnits: ['head', 'cup', 'lb'],
  },
  { name: 'Spinach', category: 'produce', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Kale', category: 'produce', commonUnits: ['cup', 'oz', 'bunch'] },
  { name: 'Lettuce', category: 'produce', commonUnits: ['head', 'cup', 'oz'] },
  {
    name: 'Romaine Lettuce',
    category: 'produce',
    commonUnits: ['head', 'cup'],
  },
  {
    name: 'Iceberg Lettuce',
    category: 'produce',
    commonUnits: ['head', 'cup'],
  },
  { name: 'Arugula', category: 'produce', commonUnits: ['cup', 'oz', 'bunch'] },
  {
    name: 'Cucumber',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
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
    name: 'Eggplant',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Mushrooms',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'lb', 'whole'],
  },
  {
    name: 'Button Mushrooms',
    category: 'produce',
    commonUnits: ['cup', 'oz', 'whole'],
  },
  {
    name: 'Portobello Mushrooms',
    category: 'produce',
    commonUnits: ['whole', 'cup'],
  },
  {
    name: 'Shiitake Mushrooms',
    category: 'produce',
    commonUnits: ['cup', 'oz'],
  },
  { name: 'Cabbage', category: 'produce', commonUnits: ['head', 'cup', 'lb'] },
  {
    name: 'Red Cabbage',
    category: 'produce',
    commonUnits: ['head', 'cup', 'lb'],
  },
  {
    name: 'Brussels Sprouts',
    category: 'produce',
    commonUnits: ['cup', 'lb', 'whole'],
  },
  { name: 'Asparagus', category: 'produce', commonUnits: ['spear', 'lb', 'oz'] },
  {
    name: 'Green Beans',
    category: 'produce',
    commonUnits: ['cup', 'lb', 'oz'],
  },
  { name: 'Peas', category: 'produce', commonUnits: ['cup', 'lb', 'oz'] },
  { name: 'Corn', category: 'produce', commonUnits: ['ear', 'cup', 'lb'] },
  { name: 'Beets', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Radish', category: 'produce', commonUnits: ['whole', 'cup', 'bunch'] },
  { name: 'Turnip', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Parsnip',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Butternut Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Acorn Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  {
    name: 'Spaghetti Squash',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Pumpkin', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Ginger',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'inch', 'oz'],
  },
  {
    name: 'Scallions',
    category: 'produce',
    commonUnits: ['whole', 'bunch', 'tbsp'],
  },
  { name: 'Leek', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Shallot', category: 'produce', commonUnits: ['whole', 'tbsp', 'cup'] },
  {
    name: 'Chives',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'bunch'],
  },

  // PRODUCE - Fruits
  { name: 'Lemon', category: 'produce', commonUnits: ['whole', 'tbsp', 'tsp'] },
  { name: 'Lime', category: 'produce', commonUnits: ['whole', 'tbsp', 'tsp'] },
  { name: 'Orange', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Grapefruit',
    category: 'produce',
    commonUnits: ['whole', 'cup'],
  },
  { name: 'Apple', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Banana', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Berries', category: 'produce', commonUnits: ['cup', 'pint', 'lb'] },
  {
    name: 'Strawberries',
    category: 'produce',
    commonUnits: ['cup', 'pint', 'lb'],
  },
  {
    name: 'Blueberries',
    category: 'produce',
    commonUnits: ['cup', 'pint', 'lb'],
  },
  {
    name: 'Raspberries',
    category: 'produce',
    commonUnits: ['cup', 'pint', 'lb'],
  },
  {
    name: 'Blackberries',
    category: 'produce',
    commonUnits: ['cup', 'pint', 'lb'],
  },
  { name: 'Grapes', category: 'produce', commonUnits: ['cup', 'lb', 'bunch'] },
  { name: 'Pear', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Peach', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Plum', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  { name: 'Mango', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
  {
    name: 'Pineapple',
    category: 'produce',
    commonUnits: ['whole', 'cup', 'lb'],
  },
  { name: 'Avocado', category: 'produce', commonUnits: ['whole', 'cup', 'lb'] },
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
  { name: 'Kiwi', category: 'produce', commonUnits: ['whole', 'cup'] },
  { name: 'Cherries', category: 'produce', commonUnits: ['cup', 'lb'] },

  // PRODUCE - Herbs
  {
    name: 'Basil',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'tsp', 'bunch'],
  },
  {
    name: 'Parsley',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'bunch'],
  },
  {
    name: 'Cilantro',
    category: 'produce',
    commonUnits: ['cup', 'tbsp', 'bunch'],
  },
  { name: 'Mint', category: 'produce', commonUnits: ['cup', 'tbsp', 'bunch'] },
  {
    name: 'Rosemary',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'sprig'],
  },
  { name: 'Thyme', category: 'produce', commonUnits: ['tbsp', 'tsp', 'sprig'] },
  { name: 'Oregano', category: 'produce', commonUnits: ['tbsp', 'tsp', 'bunch'] },
  { name: 'Dill', category: 'produce', commonUnits: ['tbsp', 'tsp', 'bunch'] },
  { name: 'Sage', category: 'produce', commonUnits: ['tbsp', 'tsp', 'leaf'] },
  {
    name: 'Tarragon',
    category: 'produce',
    commonUnits: ['tbsp', 'tsp', 'sprig'],
  },
  { name: 'Bay Leaves', category: 'produce', commonUnits: ['leaf', 'whole'] },

  // DAIRY
  { name: 'Milk', category: 'dairy', commonUnits: ['cup', 'tbsp', 'tsp', 'fl oz'] },
  {
    name: 'Whole Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'fl oz'],
  },
  {
    name: '2% Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'fl oz'],
  },
  {
    name: 'Skim Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'fl oz'],
  },
  {
    name: 'Almond Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'fl oz'],
  },
  {
    name: 'Oat Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'fl oz'],
  },
  {
    name: 'Soy Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'fl oz'],
  },
  {
    name: 'Coconut Milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'fl oz', 'can'],
  },
  {
    name: 'Heavy Cream',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'fl oz'],
  },
  {
    name: 'Half and Half',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'fl oz'],
  },
  {
    name: 'Sour Cream',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Cream Cheese',
    category: 'dairy',
    commonUnits: ['oz', 'tbsp', 'cup'],
  },
  {
    name: 'Greek Yogurt',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  { name: 'Yogurt', category: 'dairy', commonUnits: ['cup', 'tbsp', 'oz'] },
  { name: 'Butter', category: 'dairy', commonUnits: ['tbsp', 'cup', 'stick', 'oz'] },
  {
    name: 'Unsalted Butter',
    category: 'dairy',
    commonUnits: ['tbsp', 'cup', 'stick'],
  },
  {
    name: 'Salted Butter',
    category: 'dairy',
    commonUnits: ['tbsp', 'cup', 'stick'],
  },
  {
    name: 'Margarine',
    category: 'dairy',
    commonUnits: ['tbsp', 'cup', 'stick'],
  },
  {
    name: 'Cheddar Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Mozzarella Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Parmesan Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
  },
  {
    name: 'Swiss Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
  },
  {
    name: 'Monterey Jack Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz'],
  },
  {
    name: 'Pepper Jack Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz'],
  },
  { name: 'Feta Cheese', category: 'dairy', commonUnits: ['cup', 'oz', 'crumble'] },
  { name: 'Goat Cheese', category: 'dairy', commonUnits: ['oz', 'tbsp', 'cup'] },
  { name: 'Blue Cheese', category: 'dairy', commonUnits: ['oz', 'cup', 'crumble'] },
  {
    name: 'Ricotta Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Cottage Cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  { name: 'Eggs', category: 'dairy', commonUnits: ['whole', 'dozen'] },
  { name: 'Egg Whites', category: 'dairy', commonUnits: ['whole', 'cup', 'tbsp'] },
  { name: 'Egg Yolks', category: 'dairy', commonUnits: ['whole', 'tbsp'] },

  // MEAT
  {
    name: 'Chicken Breast',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'piece'],
  },
  {
    name: 'Chicken Thighs',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'piece'],
  },
  {
    name: 'Chicken Wings',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'piece'],
  },
  {
    name: 'Chicken Drumsticks',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'piece'],
  },
  {
    name: 'Whole Chicken',
    category: 'meat',
    commonUnits: ['whole', 'lb'],
  },
  {
    name: 'Ground Chicken',
    category: 'meat',
    commonUnits: ['lb', 'oz'],
  },
  { name: 'Turkey', category: 'meat', commonUnits: ['lb', 'oz', 'whole'] },
  {
    name: 'Ground Turkey',
    category: 'meat',
    commonUnits: ['lb', 'oz'],
  },
  {
    name: 'Turkey Breast',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'slice'],
  },
  { name: 'Beef', category: 'meat', commonUnits: ['lb', 'oz'] },
  { name: 'Ground Beef', category: 'meat', commonUnits: ['lb', 'oz'] },
  { name: 'Steak', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Ribeye Steak', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Sirloin Steak', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  {
    name: 'Flank Steak',
    category: 'meat',
    commonUnits: ['lb', 'oz', 'piece'],
  },
  { name: 'Chuck Roast', category: 'meat', commonUnits: ['lb', 'oz'] },
  { name: 'Brisket', category: 'meat', commonUnits: ['lb', 'oz'] },
  { name: 'Short Ribs', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Pork', category: 'meat', commonUnits: ['lb', 'oz'] },
  { name: 'Pork Chops', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Pork Tenderloin', category: 'meat', commonUnits: ['lb', 'oz'] },
  { name: 'Pork Shoulder', category: 'meat', commonUnits: ['lb', 'oz'] },
  { name: 'Ground Pork', category: 'meat', commonUnits: ['lb', 'oz'] },
  { name: 'Bacon', category: 'meat', commonUnits: ['slice', 'lb', 'oz'] },
  { name: 'Sausage', category: 'meat', commonUnits: ['link', 'lb', 'oz'] },
  {
    name: 'Italian Sausage',
    category: 'meat',
    commonUnits: ['link', 'lb', 'oz'],
  },
  {
    name: 'Chorizo',
    category: 'meat',
    commonUnits: ['link', 'lb', 'oz'],
  },
  { name: 'Ham', category: 'meat', commonUnits: ['lb', 'oz', 'slice'] },
  { name: 'Prosciutto', category: 'meat', commonUnits: ['oz', 'slice'] },
  { name: 'Lamb', category: 'meat', commonUnits: ['lb', 'oz'] },
  { name: 'Lamb Chops', category: 'meat', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Ground Lamb', category: 'meat', commonUnits: ['lb', 'oz'] },

  // SEAFOOD
  { name: 'Salmon', category: 'seafood', commonUnits: ['lb', 'oz', 'fillet'] },
  { name: 'Tuna', category: 'seafood', commonUnits: ['lb', 'oz', 'can'] },
  { name: 'Cod', category: 'seafood', commonUnits: ['lb', 'oz', 'fillet'] },
  { name: 'Halibut', category: 'seafood', commonUnits: ['lb', 'oz', 'fillet'] },
  { name: 'Tilapia', category: 'seafood', commonUnits: ['lb', 'oz', 'fillet'] },
  { name: 'Mahi Mahi', category: 'seafood', commonUnits: ['lb', 'oz', 'fillet'] },
  { name: 'Swordfish', category: 'seafood', commonUnits: ['lb', 'oz', 'steak'] },
  { name: 'Shrimp', category: 'seafood', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Scallops', category: 'seafood', commonUnits: ['lb', 'oz', 'piece'] },
  { name: 'Lobster', category: 'seafood', commonUnits: ['whole', 'lb', 'oz'] },
  { name: 'Crab', category: 'seafood', commonUnits: ['whole', 'lb', 'oz'] },
  { name: 'Clams', category: 'seafood', commonUnits: ['lb', 'oz', 'dozen'] },
  { name: 'Mussels', category: 'seafood', commonUnits: ['lb', 'oz'] },
  { name: 'Oysters', category: 'seafood', commonUnits: ['dozen', 'piece'] },
  { name: 'Squid', category: 'seafood', commonUnits: ['lb', 'oz'] },
  { name: 'Octopus', category: 'seafood', commonUnits: ['lb', 'oz'] },
  { name: 'Anchovies', category: 'seafood', commonUnits: ['can', 'oz', 'fillet'] },
  { name: 'Sardines', category: 'seafood', commonUnits: ['can', 'oz'] },

  // PANTRY - Grains & Pasta
  {
    name: 'All-Purpose Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'lb'],
  },
  {
    name: 'Bread Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'lb'],
  },
  {
    name: 'Whole Wheat Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'lb'],
  },
  {
    name: 'Cake Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp'],
  },
  {
    name: 'Self-Rising Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp'],
  },
  {
    name: 'Almond Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp'],
  },
  {
    name: 'Coconut Flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp'],
  },
  { name: 'Rice', category: 'pantry', commonUnits: ['cup', 'lb', 'oz'] },
  {
    name: 'White Rice',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },
  {
    name: 'Brown Rice',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },
  {
    name: 'Jasmine Rice',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },
  {
    name: 'Basmati Rice',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },
  {
    name: 'Arborio Rice',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },
  { name: 'Quinoa', category: 'pantry', commonUnits: ['cup', 'lb', 'oz'] },
  { name: 'Couscous', category: 'pantry', commonUnits: ['cup', 'lb', 'oz'] },
  { name: 'Bulgur', category: 'pantry', commonUnits: ['cup', 'lb', 'oz'] },
  { name: 'Farro', category: 'pantry', commonUnits: ['cup', 'lb', 'oz'] },
  { name: 'Barley', category: 'pantry', commonUnits: ['cup', 'lb', 'oz'] },
  { name: 'Oats', category: 'pantry', commonUnits: ['cup', 'lb', 'oz'] },
  {
    name: 'Rolled Oats',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },
  {
    name: 'Steel Cut Oats',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },
  {
    name: 'Instant Oats',
    category: 'pantry',
    commonUnits: ['cup', 'packet'],
  },
  { name: 'Pasta', category: 'pantry', commonUnits: ['lb', 'oz', 'cup'] },
  {
    name: 'Spaghetti',
    category: 'pantry',
    commonUnits: ['lb', 'oz'],
  },
  {
    name: 'Penne',
    category: 'pantry',
    commonUnits: ['lb', 'oz', 'cup'],
  },
  {
    name: 'Rigatoni',
    category: 'pantry',
    commonUnits: ['lb', 'oz', 'cup'],
  },
  {
    name: 'Fettuccine',
    category: 'pantry',
    commonUnits: ['lb', 'oz'],
  },
  {
    name: 'Linguine',
    category: 'pantry',
    commonUnits: ['lb', 'oz'],
  },
  {
    name: 'Macaroni',
    category: 'pantry',
    commonUnits: ['lb', 'oz', 'cup'],
  },
  {
    name: 'Lasagna Noodles',
    category: 'pantry',
    commonUnits: ['lb', 'oz', 'sheet'],
  },
  {
    name: 'Egg Noodles',
    category: 'pantry',
    commonUnits: ['lb', 'oz', 'cup'],
  },

  // PANTRY - Beans & Legumes
  {
    name: 'Black Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'lb'],
  },
  {
    name: 'Kidney Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'lb'],
  },
  {
    name: 'Pinto Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'lb'],
  },
  {
    name: 'Cannellini Beans',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'lb'],
  },
  {
    name: 'Chickpeas',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'lb'],
  },
  {
    name: 'Lentils',
    category: 'pantry',
    commonUnits: ['cup', 'lb', 'oz'],
  },
  {
    name: 'Red Lentils',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },
  {
    name: 'Green Lentils',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },
  {
    name: 'Split Peas',
    category: 'pantry',
    commonUnits: ['cup', 'lb'],
  },

  // PANTRY - Oils & Vinegars
  {
    name: 'Olive Oil',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'tsp', 'fl oz'],
  },
  {
    name: 'Extra Virgin Olive Oil',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'fl oz'],
  },
  {
    name: 'Vegetable Oil',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'fl oz'],
  },
  {
    name: 'Canola Oil',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'fl oz'],
  },
  {
    name: 'Coconut Oil',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'oz'],
  },
  {
    name: 'Sesame Oil',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'fl oz'],
  },
  {
    name: 'Avocado Oil',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'fl oz'],
  },
  {
    name: 'Peanut Oil',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'fl oz'],
  },
  {
    name: 'White Vinegar',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'tsp'],
  },
  {
    name: 'Apple Cider Vinegar',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'tsp'],
  },
  {
    name: 'Balsamic Vinegar',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
  },
  {
    name: 'Red Wine Vinegar',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
  },
  {
    name: 'White Wine Vinegar',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
  },
  {
    name: 'Rice Vinegar',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
  },

  // PANTRY - Condiments & Sauces
  {
    name: 'Soy Sauce',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
  },
  {
    name: 'Worcestershire Sauce',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp'],
  },
  {
    name: 'Hot Sauce',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'dash'],
  },
  {
    name: 'Ketchup',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'tsp'],
  },
  {
    name: 'Mustard',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp'],
  },
  {
    name: 'Dijon Mustard',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp'],
  },
  {
    name: 'Yellow Mustard',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp'],
  },
  {
    name: 'Mayonnaise',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'tsp'],
  },
  {
    name: 'Salsa',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'jar'],
  },
  {
    name: 'Tomato Sauce',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Tomato Paste',
    category: 'pantry',
    commonUnits: ['tbsp', 'can', 'oz'],
  },
  {
    name: 'Crushed Tomatoes',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Diced Tomatoes',
    category: 'pantry',
    commonUnits: ['can', 'cup', 'oz'],
  },
  {
    name: 'Marinara Sauce',
    category: 'pantry',
    commonUnits: ['jar', 'cup'],
  },
  {
    name: 'Pasta Sauce',
    category: 'pantry',
    commonUnits: ['jar', 'cup'],
  },
  {
    name: 'Pesto',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'jar'],
  },
  {
    name: 'Peanut Butter',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'jar'],
  },
  {
    name: 'Almond Butter',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup'],
  },
  {
    name: 'Tahini',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup'],
  },
  {
    name: 'Honey',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'tsp'],
  },
  {
    name: 'Maple Syrup',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'tsp'],
  },
  {
    name: 'Agave Nectar',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'tsp'],
  },

  // PANTRY - Spices & Seasonings
  { name: 'Salt', category: 'pantry', commonUnits: ['tsp', 'tbsp', 'pinch'] },
  {
    name: 'Black Pepper',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
  },
  {
    name: 'Garlic Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Onion Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Paprika',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Smoked Paprika',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Cayenne Pepper',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
  },
  {
    name: 'Chili Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Cumin',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Ground Cumin',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Coriander',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Turmeric',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Ginger Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Cinnamon',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Nutmeg',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
  },
  {
    name: 'Cloves',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'whole'],
  },
  {
    name: 'Allspice',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Cardamom',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'pod'],
  },
  {
    name: 'Curry Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Italian Seasoning',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Dried Oregano',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Dried Basil',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Dried Thyme',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Dried Rosemary',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Dried Parsley',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Dried Dill',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Red Pepper Flakes',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
  },
  {
    name: 'Vanilla Extract',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Almond Extract',
    category: 'pantry',
    commonUnits: ['tsp', 'drop'],
  },

  // PANTRY - Baking
  {
    name: 'White Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Brown Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Powdered Sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp'],
  },
  {
    name: 'Baking Powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Baking Soda',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
  },
  {
    name: 'Cornstarch',
    category: 'pantry',
    commonUnits: ['tbsp', 'cup', 'tsp'],
  },
  {
    name: 'Cocoa Powder',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
  },
  {
    name: 'Chocolate Chips',
    category: 'pantry',
    commonUnits: ['cup', 'oz', 'tbsp'],
  },
  {
    name: 'Semi-Sweet Chocolate Chips',
    category: 'pantry',
    commonUnits: ['cup', 'oz'],
  },
  {
    name: 'Dark Chocolate Chips',
    category: 'pantry',
    commonUnits: ['cup', 'oz'],
  },
  {
    name: 'Yeast',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp', 'packet'],
  },
  {
    name: 'Active Dry Yeast',
    category: 'pantry',
    commonUnits: ['tsp', 'packet'],
  },

  // PANTRY - Nuts & Seeds
  { name: 'Almonds', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Walnuts', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Pecans', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Cashews', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Peanuts', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Pistachios', category: 'pantry', commonUnits: ['cup', 'oz', 'lb'] },
  { name: 'Sunflower Seeds', category: 'pantry', commonUnits: ['cup', 'oz', 'tbsp'] },
  { name: 'Pumpkin Seeds', category: 'pantry', commonUnits: ['cup', 'oz', 'tbsp'] },
  { name: 'Chia Seeds', category: 'pantry', commonUnits: ['tbsp', 'cup', 'oz'] },
  { name: 'Flax Seeds', category: 'pantry', commonUnits: ['tbsp', 'cup', 'oz'] },
  { name: 'Sesame Seeds', category: 'pantry', commonUnits: ['tbsp', 'tsp', 'cup'] },

  // PANTRY - Canned/Jarred
  {
    name: 'Chicken Broth',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Beef Broth',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Vegetable Broth',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Chicken Stock',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Beef Stock',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },
  {
    name: 'Vegetable Stock',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
  },

  // BAKERY
  { name: 'Bread', category: 'bakery', commonUnits: ['slice', 'loaf', 'oz'] },
  {
    name: 'White Bread',
    category: 'bakery',
    commonUnits: ['slice', 'loaf'],
  },
  {
    name: 'Whole Wheat Bread',
    category: 'bakery',
    commonUnits: ['slice', 'loaf'],
  },
  {
    name: 'Sourdough Bread',
    category: 'bakery',
    commonUnits: ['slice', 'loaf'],
  },
  {
    name: 'Baguette',
    category: 'bakery',
    commonUnits: ['whole', 'slice', 'oz'],
  },
  { name: 'Rolls', category: 'bakery', commonUnits: ['whole', 'oz'] },
  {
    name: 'Hamburger Buns',
    category: 'bakery',
    commonUnits: ['whole', 'package'],
  },
  {
    name: 'Hot Dog Buns',
    category: 'bakery',
    commonUnits: ['whole', 'package'],
  },
  { name: 'Tortillas', category: 'bakery', commonUnits: ['whole', 'package'] },
  {
    name: 'Flour Tortillas',
    category: 'bakery',
    commonUnits: ['whole', 'package'],
  },
  {
    name: 'Corn Tortillas',
    category: 'bakery',
    commonUnits: ['whole', 'package'],
  },
  { name: 'Pita Bread', category: 'bakery', commonUnits: ['whole', 'package'] },
  { name: 'Naan', category: 'bakery', commonUnits: ['whole', 'piece'] },
  { name: 'Bagels', category: 'bakery', commonUnits: ['whole', 'oz'] },
  { name: 'English Muffins', category: 'bakery', commonUnits: ['whole', 'package'] },
  { name: 'Croissants', category: 'bakery', commonUnits: ['whole', 'oz'] },

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
    name: 'Frozen Mixed Berries',
    category: 'frozen',
    commonUnits: ['cup', 'bag', 'oz'],
  },
  { name: 'Ice Cream', category: 'frozen', commonUnits: ['pint', 'cup', 'scoop'] },
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

  // OTHER
  { name: 'Water', category: 'other', commonUnits: ['cup', 'tbsp', 'tsp', 'oz'] },
  { name: 'Coffee', category: 'other', commonUnits: ['cup', 'tbsp', 'tsp'] },
  { name: 'Tea', category: 'other', commonUnits: ['bag', 'cup', 'tsp'] },
  { name: 'Wine', category: 'other', commonUnits: ['cup', 'bottle', 'glass'] },
  { name: 'Red Wine', category: 'other', commonUnits: ['cup', 'bottle', 'glass'] },
  { name: 'White Wine', category: 'other', commonUnits: ['cup', 'bottle', 'glass'] },
  { name: 'Beer', category: 'other', commonUnits: ['bottle', 'can', 'cup'] },
];
