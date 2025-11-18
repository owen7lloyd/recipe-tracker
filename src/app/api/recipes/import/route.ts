import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseSchemaOrg } from '@/lib/recipe-scraper/schema-org';
import { parseRecipeFromHtml } from '@/lib/recipe-scraper/html-parser';
import { mapIngredients } from '@/lib/recipe-scraper/ingredient-matcher';

/**
 * Validate URL format
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * POST /api/recipes/import
 * Import a recipe from a URL
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the page with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; RecipeTrackerBot/1.0; +https://recipe-tracker.com)',
        },
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: 'Unable to fetch the recipe. Please check the URL.' },
        { status: 400 }
      );
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Unable to fetch recipe (HTTP ${response.status})`,
        },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Try schema.org parser first
    let recipe = parseSchemaOrg(html);

    // Fall back to HTML parsing if schema.org not found
    if (!recipe) {
      recipe = parseRecipeFromHtml(html, url);
    }

    if (!recipe) {
      return NextResponse.json(
        {
          error:
            'No recipe data found on this page. Please make sure the URL points to a recipe.',
        },
        { status: 400 }
      );
    }

    // Map ingredients to database
    const mappedIngredients = await mapIngredients(recipe.ingredients);

    // Return parsed recipe data
    return NextResponse.json({
      recipe: {
        title: recipe.title,
        description: recipe.description || '',
        imageUrl: recipe.imageUrl || null,
        sourceUrl: url,
        category: recipe.category || 'dinner',
        tags: recipe.tags || [],
        prepTimeMinutes: recipe.prepTimeMinutes || null,
        cookTimeMinutes: recipe.cookTimeMinutes || null,
        servings: recipe.servings || 4,
        rating: recipe.rating || null,
        ingredients: mappedIngredients,
        instructions: recipe.instructions,
      },
      source: recipe.source,
    });
  } catch (error) {
    console.error('Error importing recipe:', error);
    return NextResponse.json(
      { error: 'An error occurred while importing the recipe' },
      { status: 500 }
    );
  }
}
