# Recipe Web Import and Scraping

**Phase:** 2 - Core Features
**Priority:** P1
**Estimate:** 6 days

## Description

Implement recipe import functionality to scrape recipes from URLs using schema.org JSON-LD and fallback HTML parsing for popular recipe websites.

## Tasks

### Schema.org Parser
- [ ] Implement JSON-LD parser for schema.org Recipe format
- [ ] Extract: title, description, image, ingredients, instructions
- [ ] Extract: prep time, cook time, servings, rating
- [ ] Handle nested ingredient structures
- [ ] Handle instruction steps

### HTML Fallback Parser
- [ ] Implement cheerio-based HTML parser
- [ ] Support Open Graph tags fallback
- [ ] Create parsers for common recipe sites:
  - [ ] AllRecipes
  - [ ] Food Network
  - [ ] Serious Eats
  - [ ] BBC Good Food
  - [ ] Bon Appétit
- [ ] Generic parser for unknown sites

### Ingredient Parsing
- [ ] Parse ingredient strings into structured data
- [ ] Extract quantity (handle fractions: 1/2, 1 1/2, etc.)
- [ ] Extract unit (cup, tbsp, tsp, oz, lb, etc.)
- [ ] Extract ingredient name
- [ ] Extract notes/modifiers (chopped, diced, etc.)
- [ ] Handle ranges (1-2 cups)
- [ ] Handle "to taste" and non-numeric quantities

### API Endpoint
- [ ] `POST /api/recipes/import`
- [ ] Input validation (valid URL, accessible)
- [ ] Timeout handling (10 second max)
- [ ] Error handling for inaccessible URLs
- [ ] Return parsed data in preview format

### Import Flow
- [ ] URL input field
- [ ] Loading state during import
- [ ] Preview parsed data in editable form
- [ ] Allow user to edit before saving
- [ ] Handle partial data (some fields missing)
- [ ] Save imported recipe

### UI Components
- [ ] `RecipeImportModal` - Dialog with URL input
- [ ] `ImportPreview` - Editable form showing parsed data
- [ ] `ImportErrorDisplay` - Clear error messages
- [ ] Loading spinner during fetch/parse

### Error Handling
- [ ] Invalid URL format
- [ ] URL not accessible (404, timeout)
- [ ] No recipe data found
- [ ] Partial data found (missing required fields)
- [ ] Parsing errors
- [ ] User-friendly error messages

## Acceptance Criteria

- [ ] Can import recipes from schema.org formatted sites
- [ ] Can import from at least 3 major recipe sites
- [ ] Ingredients parsed into structured format (quantity, unit, name)
- [ ] Instructions preserved as steps
- [ ] Image URL captured
- [ ] Times and servings extracted
- [ ] Preview shows all parsed data
- [ ] User can edit parsed data before saving
- [ ] Handles errors gracefully
- [ ] Import completes in < 10 seconds
- [ ] Partial data allows manual completion

## Technical Details

### Schema.org Parser

```typescript
interface RecipeSchema {
  "@type": "Recipe"
  name: string
  description?: string
  image?: string | string[]
  recipeIngredient: string[]
  recipeInstructions: string | { text: string }[]
  prepTime?: string // ISO 8601 duration
  cookTime?: string
  recipeYield?: string | number
  aggregateRating?: {
    ratingValue: number
  }
}

function parseSchemaOrg(html: string): ParsedRecipe | null {
  const $ = cheerio.load(html)
  const scripts = $('script[type="application/ld+json"]')

  for (const script of scripts) {
    try {
      const data = JSON.parse($(script).html() || '')
      const recipe = Array.isArray(data)
        ? data.find(item => item['@type'] === 'Recipe')
        : data['@type'] === 'Recipe' ? data : null

      if (recipe) {
        return {
          title: recipe.name,
          description: recipe.description,
          image_url: Array.isArray(recipe.image) ? recipe.image[0] : recipe.image,
          prep_time_minutes: parseDuration(recipe.prepTime),
          cook_time_minutes: parseDuration(recipe.cookTime),
          servings: parseServings(recipe.recipeYield),
          rating: recipe.aggregateRating?.ratingValue,
          ingredients: recipe.recipeIngredient.map(parseIngredient),
          instructions: parseInstructions(recipe.recipeInstructions)
        }
      }
    } catch (error) {
      continue
    }
  }

  return null
}
```

### Ingredient Parser

```typescript
function parseIngredient(ingredientString: string): ParsedIngredient {
  // Examples:
  // "2 cups all-purpose flour"
  // "1/2 teaspoon salt"
  // "1 pound ground beef, browned"
  // "3-4 tomatoes, diced"

  const regex = /^(\d+(?:\/\d+)?(?:\s+\d+\/\d+)?)\s*([a-z]+)?\s+(.+)$/i
  const match = ingredientString.match(regex)

  if (match) {
    const [, quantityStr, unit, rest] = match
    const quantity = parseQuantity(quantityStr) // Convert fractions to decimal
    const [name, ...notes] = rest.split(',').map(s => s.trim())

    return {
      quantity,
      unit: unit || '',
      name,
      notes: notes.join(', ') || undefined
    }
  }

  // No quantity found, return as-is
  return {
    name: ingredientString
  }
}

function parseQuantity(str: string): number {
  // Handle: "2", "1/2", "1 1/2", "0.5"
  if (str.includes('/')) {
    const parts = str.split(/\s+/)
    let total = 0

    for (const part of parts) {
      if (part.includes('/')) {
        const [num, denom] = part.split('/').map(Number)
        total += num / denom
      } else {
        total += Number(part)
      }
    }

    return total
  }

  return parseFloat(str)
}
```

### API Implementation

```typescript
// POST /api/recipes/import
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { url } = await req.json()

  // Validate URL
  if (!isValidUrl(url)) {
    return Response.json({ error: "Invalid URL" }, { status: 400 })
  }

  try {
    // Fetch the page with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeTrackerBot/1.0)'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return Response.json({
        error: `Unable to fetch recipe (${response.status})`
      }, { status: 400 })
    }

    const html = await response.text()

    // Try schema.org first
    let recipe = parseSchemaOrg(html)

    // Fall back to HTML parsing
    if (!recipe) {
      recipe = parseHtml(html, url)
    }

    if (!recipe) {
      return Response.json({
        error: "No recipe data found on this page"
      }, { status: 400 })
    }

    // Map ingredients to our database
    const mappedIngredients = await mapIngredients(recipe.ingredients)

    return Response.json({
      recipe: {
        ...recipe,
        source_url: url,
        ingredients: mappedIngredients
      },
      source: recipe.source || 'schema'
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      return Response.json({
        error: "Request timed out"
      }, { status: 408 })
    }

    return Response.json({
      error: "Failed to import recipe"
    }, { status: 500 })
  }
}
```

## Dependencies

- [ ] #05 Recipe CRUD completed
- [ ] #06 Pantry Management (for ingredient matching)
- [ ] cheerio package installed
- [ ] Recipe import UI in recipe form

## Testing

- [ ] Test with schema.org formatted recipes
- [ ] Test with each supported recipe site
- [ ] Test with invalid URLs
- [ ] Test with non-recipe pages
- [ ] Test ingredient parsing with various formats
- [ ] Test duration parsing (ISO 8601)
- [ ] Test timeout handling
- [ ] Test partial data handling
- [ ] E2E test: Import → Preview → Edit → Save

## Resources

- [Schema.org Recipe](https://schema.org/Recipe)
- [recipe-scrapers library](https://github.com/hhursev/recipe-scrapers) (Python, for reference)
- PRD Section 3.2: Recipe Management (US-2.2)
- Implementation Plan: Section 2.1 Recipe Web Import
