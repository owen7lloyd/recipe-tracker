import { test, expect } from '@playwright/test'

/**
 * Recipe CRUD E2E Tests
 * Tests creating, reading, updating, and deleting recipes
 */

test.describe.skip('Recipe Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    // This requires authentication setup
    await page.goto('/login')
    // ... authentication steps
  })

  test('should create a new recipe', async ({ page }) => {
    await page.goto('/dashboard/recipes')
    await page.click('button:has-text("Add Recipe")')

    // Fill in recipe details
    await page.fill('[name=title]', 'E2E Test Recipe')
    await page.selectOption('[name=category]', 'dinner')
    await page.fill('[name=servings]', '4')
    await page.fill('[name=prepTimeMinutes]', '15')
    await page.fill('[name=cookTimeMinutes]', '30')

    // Add an ingredient
    await page.click('button:has-text("Add Ingredient")')
    await page.fill('[data-testid=ingredient-search-0]', 'flour')
    await page.click('[data-testid=ingredient-option]:first-child')
    await page.fill('[data-testid=ingredient-quantity-0]', '2')
    await page.selectOption('[data-testid=ingredient-unit-0]', 'cups')

    // Add an instruction
    await page.fill('[data-testid=instruction-0]', 'Mix all ingredients together')
    await page.click('button:has-text("Add Step")')
    await page.fill('[data-testid=instruction-1]', 'Bake at 350°F for 30 minutes')

    // Save recipe
    await page.click('button:has-text("Save Recipe")')

    // Should show success message
    await expect(page.locator('text=/Recipe.*saved/i')).toBeVisible()

    // Should navigate to recipe detail page
    await expect(page).toHaveURL(/\/dashboard\/recipes\/[a-z0-9-]+/)

    // Verify recipe details are displayed
    await expect(page.locator('h1')).toContainText('E2E Test Recipe')
    await expect(page.locator('text=4 servings')).toBeVisible()
    await expect(page.locator('text=2 cups flour')).toBeVisible()
  })

  test('should view recipe details', async ({ page }) => {
    // Navigate to recipes list
    await page.goto('/dashboard/recipes')

    // Click on first recipe
    await page.click('[data-testid=recipe-card]:first-child')

    // Should show recipe details
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=/servings/i')).toBeVisible()
    await expect(page.locator('text=/Ingredients/i')).toBeVisible()
    await expect(page.locator('text=/Instructions/i')).toBeVisible()
  })

  test('should edit recipe', async ({ page }) => {
    await page.goto('/dashboard/recipes')

    // Click on first recipe
    await page.click('[data-testid=recipe-card]:first-child')

    // Click edit button
    await page.click('button:has-text("Edit")')

    // Update title
    await page.fill('[name=title]', 'Updated Recipe Title')

    // Save changes
    await page.click('button:has-text("Save")')

    // Should show success message
    await expect(page.locator('text=/updated/i')).toBeVisible()

    // Verify changes
    await expect(page.locator('h1')).toContainText('Updated Recipe Title')
  })

  test('should delete recipe', async ({ page }) => {
    await page.goto('/dashboard/recipes')

    // Get initial count of recipes
    const initialCount = await page.locator('[data-testid=recipe-card]').count()

    // Click on first recipe
    await page.click('[data-testid=recipe-card]:first-child')

    // Click delete button
    await page.click('button:has-text("Delete")')

    // Confirm deletion in dialog
    await page.click('button:has-text("Confirm")')

    // Should navigate back to recipes list
    await expect(page).toHaveURL('/dashboard/recipes')

    // Should show success message
    await expect(page.locator('text=/deleted/i')).toBeVisible()

    // Should have one fewer recipe
    const finalCount = await page.locator('[data-testid=recipe-card]').count()
    expect(finalCount).toBe(initialCount - 1)
  })

  test('should scale recipe servings', async ({ page }) => {
    await page.goto('/dashboard/recipes')

    // Click on a recipe
    await page.click('[data-testid=recipe-card]:first-child')

    // Change servings
    await page.fill('[data-testid=servings-input]', '8')

    // Verify ingredients are scaled
    // This will depend on the actual recipe data
    // The quantities should be doubled if original was 4 servings
    await expect(page.locator('[data-testid=scaled-indicator]')).toBeVisible()
  })
})
