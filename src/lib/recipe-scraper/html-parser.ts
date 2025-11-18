/**
 * HTML Fallback Parser
 * Parses recipe data from HTML when schema.org data is not available
 */

import * as cheerio from 'cheerio';
import { parseIngredients, type ParsedIngredient } from './ingredient-parser';
import { type ParsedRecipeData, extractCategory } from './schema-org';

/**
 * Extract title from HTML
 */
function extractTitle($: cheerio.CheerioAPI): string | undefined {
  // Try various common selectors
  const selectors = [
    'h1.recipe-title',
    'h1.recipe__title',
    'h1[itemprop="name"]',
    '.recipe-header h1',
    'h1',
    '[property="og:title"]',
    'meta[property="og:title"]',
    'title',
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      const text =
        element.attr('content') || element.text().trim();
      if (text) return text;
    }
  }

  return undefined;
}

/**
 * Extract description from HTML
 */
function extractDescription($: cheerio.CheerioAPI): string | undefined {
  const selectors = [
    '.recipe-description',
    '.recipe__description',
    '[itemprop="description"]',
    'meta[name="description"]',
    'meta[property="og:description"]',
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      const text = element.attr('content') || element.text().trim();
      if (text) return text;
    }
  }

  return undefined;
}

/**
 * Extract image URL from HTML
 */
function extractImage($: cheerio.CheerioAPI): string | undefined {
  const selectors = [
    '.recipe-image img',
    '.recipe__image img',
    '[itemprop="image"]',
    'meta[property="og:image"]',
    '.recipe-hero img',
    'img.recipe-img',
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      const src =
        element.attr('content') ||
        element.attr('src') ||
        element.attr('data-src');
      if (src && src.startsWith('http')) return src;
    }
  }

  return undefined;
}

/**
 * Extract ingredients from HTML
 */
function extractIngredients($: cheerio.CheerioAPI): string[] {
  const ingredients: string[] = [];

  // Try various common selectors
  const selectors = [
    '.recipe-ingredients li',
    '.recipe__ingredients li',
    '[itemprop="recipeIngredient"]',
    '.ingredient-list li',
    '.ingredients li',
    'ul.ingredients li',
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      elements.each((_, el) => {
        const text = $(el).text().trim();
        if (text) ingredients.push(text);
      });

      if (ingredients.length > 0) break;
    }
  }

  return ingredients;
}

/**
 * Extract instructions from HTML
 */
function extractInstructions($: cheerio.CheerioAPI): string[] {
  const instructions: string[] = [];

  // Try various common selectors
  const selectors = [
    '.recipe-instructions li',
    '.recipe__instructions li',
    '[itemprop="recipeInstructions"] li',
    '.instruction-list li',
    '.instructions li',
    'ol.instructions li',
    '.recipe-steps li',
    '.steps li',
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      elements.each((_, el) => {
        const text = $(el).text().trim();
        if (text) instructions.push(text);
      });

      if (instructions.length > 0) break;
    }
  }

  // If no list items found, try paragraph selectors
  if (instructions.length === 0) {
    const paragraphSelectors = [
      '.recipe-instructions p',
      '.recipe__instructions p',
      '[itemprop="recipeInstructions"] p',
      '.instructions p',
    ];

    for (const selector of paragraphSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((_, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 10) instructions.push(text);
        });

        if (instructions.length > 0) break;
      }
    }
  }

  return instructions;
}

/**
 * Extract time in minutes from text
 */
function extractTimeMinutes(text: string): number | undefined {
  if (!text) return undefined;

  // Look for patterns like "30 min", "1 hour", "1 hr 30 min"
  const hourMatch = text.match(/(\d+)\s*(?:hour|hr|h)/i);
  const minMatch = text.match(/(\d+)\s*(?:minute|min|m)/i);

  let minutes = 0;
  if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) minutes += parseInt(minMatch[1], 10);

  return minutes > 0 ? minutes : undefined;
}

/**
 * Extract prep time from HTML
 */
function extractPrepTime($: cheerio.CheerioAPI): number | undefined {
  const selectors = [
    '.recipe-prep-time',
    '.prep-time',
    '[itemprop="prepTime"]',
    '.recipe__prep-time',
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      const text = element.text().trim();
      const time = extractTimeMinutes(text);
      if (time) return time;
    }
  }

  return undefined;
}

/**
 * Extract cook time from HTML
 */
function extractCookTime($: cheerio.CheerioAPI): number | undefined {
  const selectors = [
    '.recipe-cook-time',
    '.cook-time',
    '[itemprop="cookTime"]',
    '.recipe__cook-time',
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      const text = element.text().trim();
      const time = extractTimeMinutes(text);
      if (time) return time;
    }
  }

  return undefined;
}

/**
 * Extract servings from HTML
 */
function extractServings($: cheerio.CheerioAPI): number | undefined {
  const selectors = [
    '.recipe-servings',
    '.servings',
    '[itemprop="recipeYield"]',
    '.recipe__servings',
    '.yield',
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      const text = element.text().trim();
      const match = text.match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
  }

  return undefined;
}

/**
 * Generic HTML parser (fallback when schema.org is not available)
 */
export function parseHtml(html: string, url?: string): ParsedRecipeData | null {
  const $ = cheerio.load(html);

  const title = extractTitle($);
  if (!title) {
    // No title found, likely not a recipe page
    return null;
  }

  const ingredientStrings = extractIngredients($);
  const instructions = extractInstructions($);

  // Require at least some ingredients or instructions
  if (ingredientStrings.length === 0 && instructions.length === 0) {
    return null;
  }

  const ingredients = parseIngredients(ingredientStrings);

  return {
    title,
    description: extractDescription($),
    imageUrl: extractImage($),
    prepTimeMinutes: extractPrepTime($),
    cookTimeMinutes: extractCookTime($),
    servings: extractServings($),
    category: extractCategory(undefined), // Will default to 'dinner'
    ingredients,
    instructions,
    source: 'html',
  };
}

/**
 * Site-specific parsers (optional, can be extended)
 */
export const siteSpecificParsers: Record<
  string,
  (html: string) => ParsedRecipeData | null
> = {
  'allrecipes.com': parseHtml,
  'foodnetwork.com': parseHtml,
  'seriouseats.com': parseHtml,
  'bbcgoodfood.com': parseHtml,
  'bonappetit.com': parseHtml,
};

/**
 * Parse recipe from HTML with optional site-specific parser
 */
export function parseRecipeFromHtml(
  html: string,
  url?: string
): ParsedRecipeData | null {
  if (!url) {
    return parseHtml(html);
  }

  // Try site-specific parser
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const parser = siteSpecificParsers[hostname];
    if (parser) {
      return parser(html);
    }
  } catch (error) {
    // Invalid URL, fall back to generic parser
  }

  // Fall back to generic parser
  return parseHtml(html);
}
