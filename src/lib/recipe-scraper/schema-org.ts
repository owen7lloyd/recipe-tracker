/**
 * Schema.org Recipe Parser
 * Parses recipe data from JSON-LD structured data (schema.org format)
 */

import * as cheerio from 'cheerio';
import { parseIngredients, type ParsedIngredient } from './ingredient-parser';

export interface SchemaOrgRecipe {
  '@type': string;
  name: string;
  description?: string;
  image?: string | string[] | { url: string }[];
  recipeIngredient?: string[];
  recipeInstructions?:
    | string
    | string[]
    | { text: string }[]
    | { '@type': string; text: string }[];
  prepTime?: string; // ISO 8601 duration
  cookTime?: string; // ISO 8601 duration
  totalTime?: string; // ISO 8601 duration
  recipeYield?: string | number | string[];
  aggregateRating?: {
    ratingValue: number | string;
  };
  recipeCategory?: string | string[];
  keywords?: string | string[];
}

export interface ParsedRecipeData {
  title: string;
  description?: string;
  imageUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  rating?: number;
  category?: string;
  tags?: string[];
  ingredients: ParsedIngredient[];
  instructions: string[];
  source: 'schema' | 'html';
}

/**
 * Parse ISO 8601 duration to minutes
 * Examples: "PT30M" = 30 minutes, "PT1H" = 60 minutes, "PT1H30M" = 90 minutes
 */
export function parseDuration(duration?: string): number | undefined {
  if (!duration) return undefined;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  return hours * 60 + minutes || undefined;
}

/**
 * Parse servings from various formats
 * Examples: "4", "4 servings", "Makes 4 servings", "4-6", ["4", "servings"]
 */
export function parseServings(
  recipeYield?: string | number | string[]
): number | undefined {
  if (!recipeYield) return undefined;

  let yieldStr: string;
  if (Array.isArray(recipeYield)) {
    yieldStr = recipeYield[0] || '';
  } else {
    yieldStr = String(recipeYield);
  }

  // Try to extract first number
  const match = yieldStr.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return undefined;
}

/**
 * Extract image URL from various formats
 */
export function extractImageUrl(
  image?: string | string[] | { url: string }[]
): string | undefined {
  if (!image) return undefined;

  if (typeof image === 'string') {
    return image;
  }

  if (Array.isArray(image)) {
    const first = image[0];
    if (!first) return undefined;

    if (typeof first === 'string') {
      return first;
    }

    if (typeof first === 'object' && 'url' in first) {
      return first.url;
    }
  }

  return undefined;
}

/**
 * Parse instructions from various formats
 */
export function parseInstructions(
  instructions?:
    | string
    | string[]
    | { text: string }[]
    | { '@type': string; text: string }[]
): string[] {
  if (!instructions) return [];

  if (typeof instructions === 'string') {
    // Split by newlines or numbers followed by period
    const steps = instructions
      .split(/\n+|\d+\.\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return steps.length > 0 ? steps : [instructions];
  }

  if (Array.isArray(instructions)) {
    return instructions
      .map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && 'text' in item) return item.text;
        return '';
      })
      .filter(Boolean);
  }

  return [];
}

/**
 * Extract category from schema.org data
 */
export function extractCategory(
  recipeCategory?: string | string[]
): 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'beverage' {
  if (!recipeCategory) return 'dinner';

  // Handle array of categories - use first one
  let categoryStr: string;
  if (Array.isArray(recipeCategory)) {
    categoryStr = recipeCategory[0] || '';
  } else if (typeof recipeCategory === 'string') {
    categoryStr = recipeCategory;
  } else {
    // Handle other types (objects, etc.)
    return 'dinner';
  }

  const normalized = categoryStr.toLowerCase();

  if (normalized.includes('breakfast')) return 'breakfast';
  if (normalized.includes('lunch')) return 'lunch';
  if (normalized.includes('dinner') || normalized.includes('main')) return 'dinner';
  if (normalized.includes('dessert') || normalized.includes('sweet')) return 'dessert';
  if (normalized.includes('snack') || normalized.includes('appetizer')) return 'snack';
  if (normalized.includes('drink') || normalized.includes('beverage')) return 'beverage';

  return 'dinner'; // Default
}

/**
 * Extract tags from keywords
 */
export function extractTags(keywords?: string | string[]): string[] {
  if (!keywords) return [];

  if (typeof keywords === 'string') {
    // Split by common separators
    return keywords
      .split(/[,;]+/)
      .map((k) => k.trim())
      .filter(Boolean);
  }

  if (Array.isArray(keywords)) {
    return keywords.filter(Boolean);
  }

  return [];
}

/**
 * Parse schema.org JSON-LD recipe data from HTML
 */
export function parseSchemaOrg(html: string): ParsedRecipeData | null {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');

  for (const script of scripts) {
    try {
      const scriptContent = $(script).html();
      if (!scriptContent) continue;

      const data = JSON.parse(scriptContent);

      // Handle both single objects and arrays
      let recipe: SchemaOrgRecipe | null = null;

      if (Array.isArray(data)) {
        recipe =
          data.find(
            (item) => item['@type'] === 'Recipe' || item['@type']?.includes('Recipe')
          ) || null;
      } else if (data['@type'] === 'Recipe' || data['@type']?.includes('Recipe')) {
        recipe = data;
      } else if (data['@graph']) {
        // Sometimes recipes are in a @graph array
        recipe =
          data['@graph'].find(
            (item: any) => item['@type'] === 'Recipe' || item['@type']?.includes('Recipe')
          ) || null;
      }

      if (recipe) {
        const ingredients = parseIngredients(recipe.recipeIngredient || []);
        const instructions = parseInstructions(recipe.recipeInstructions);

        return {
          title: recipe.name,
          description: recipe.description,
          imageUrl: extractImageUrl(recipe.image),
          prepTimeMinutes: parseDuration(recipe.prepTime),
          cookTimeMinutes: parseDuration(recipe.cookTime),
          servings: parseServings(recipe.recipeYield),
          rating:
            recipe.aggregateRating?.ratingValue
              ? Math.round(Number(recipe.aggregateRating.ratingValue))
              : undefined,
          category: extractCategory(recipe.recipeCategory),
          tags: extractTags(recipe.keywords),
          ingredients,
          instructions,
          source: 'schema',
        };
      }
    } catch (error) {
      // Continue to next script tag if parsing fails
      console.error('Error parsing JSON-LD:', error);
      continue;
    }
  }

  return null;
}
