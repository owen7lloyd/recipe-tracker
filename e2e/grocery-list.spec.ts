import { test, expect } from '@playwright/test'

/**
 * Grocery List E2E Tests
 * Tests generating, managing, and sharing grocery lists
 */

test.describe.skip('Grocery List Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    // ... authentication steps
  })

  test('should generate grocery list from recipes', async ({ page }) => {
    await page.goto('/dashboard/recipes')

    // Select multiple recipes
    await page.click('[data-testid=recipe-checkbox]:nth-child(1)')
    await page.click('[data-testid=recipe-checkbox]:nth-child(2)')
    await page.click('[data-testid=recipe-checkbox]:nth-child(3)')

    // Click "Generate Grocery List" button
    await page.click('button:has-text("Generate Grocery List")')

    // Should navigate to grocery list creation page
    await expect(page).toHaveURL(/\/dashboard\/grocery-lists\/new/)

    // Should show selected recipes
    await expect(page.locator('[data-testid=selected-recipe]')).toHaveCount(3)

    // Generate list
    await page.click('button:has-text("Create List")')

    // Should navigate to list detail page
    await expect(page).toHaveURL(/\/dashboard\/grocery-lists\/[a-z0-9-]+/)

    // Should show grocery list items grouped by category
    await expect(page.locator('[data-testid=category-group]')).not.toHaveCount(0)
    await expect(page.locator('[data-testid=grocery-item]')).not.toHaveCount(0)
  })

  test('should check off items in grocery list', async ({ page }) => {
    await page.goto('/dashboard/grocery-lists')

    // Click on first list
    await page.click('[data-testid=grocery-list-card]:first-child')

    // Check off an item
    const firstItem = page.locator('[data-testid=grocery-item]:first-child')
    await firstItem.locator('[data-testid=item-checkbox]').click()

    // Item should be marked as checked
    await expect(firstItem).toHaveClass(/checked|completed/)

    // Progress bar should update
    const progressText = await page.locator('[data-testid=progress-indicator]').textContent()
    expect(progressText).toMatch(/\d+ of \d+/)
  })

  test('should share grocery list', async ({ page }) => {
    await page.goto('/dashboard/grocery-lists')

    // Click on first list
    await page.click('[data-testid=grocery-list-card]:first-child')

    // Click share button
    await page.click('button:has-text("Share")')

    // Should show share dialog with link
    await expect(page.locator('[data-testid=share-dialog]')).toBeVisible()

    // Copy share link
    await page.click('button:has-text("Copy Link")')

    // Should show success message
    await expect(page.locator('text=/copied/i')).toBeVisible()
  })

  test('should view shared grocery list', async ({ page, context }) => {
    // First, create a list and get the share link
    await page.goto('/dashboard/grocery-lists')
    await page.click('[data-testid=grocery-list-card]:first-child')
    await page.click('button:has-text("Share")')

    const shareLink = await page.locator('[data-testid=share-link]').textContent()

    // Open share link in new page (simulating different user)
    const sharedPage = await context.newPage()
    await sharedPage.goto(shareLink || '')

    // Should display the shared list
    await expect(sharedPage.locator('[data-testid=shared-list-indicator]')).toBeVisible()
    await expect(sharedPage.locator('[data-testid=grocery-item]')).not.toHaveCount(0)

    // Should be able to check off items
    await sharedPage.locator('[data-testid=grocery-item]:first-child [data-testid=item-checkbox]').click()

    // Changes should sync in real-time to original page
    // Wait a moment for real-time sync
    await page.waitForTimeout(1000)

    // First item on original page should also be checked
    await expect(page.locator('[data-testid=grocery-item]:first-child')).toHaveClass(/checked|completed/)
  })

  test('should organize items by store categories', async ({ page }) => {
    await page.goto('/dashboard/grocery-lists')
    await page.click('[data-testid=grocery-list-card]:first-child')

    // Should show category headers
    await expect(page.locator('text=Produce')).toBeVisible()
    await expect(page.locator('text=Dairy')).toBeVisible()
    await expect(page.locator('text=Meat')).toBeVisible()

    // Items should be grouped under categories
    const produceSection = page.locator('[data-testid=category-produce]')
    const produceItems = await produceSection.locator('[data-testid=grocery-item]').count()
    expect(produceItems).toBeGreaterThan(0)
  })

  test('should complete grocery list', async ({ page }) => {
    await page.goto('/dashboard/grocery-lists')
    await page.click('[data-testid=grocery-list-card]:first-child')

    // Mark list as complete
    await page.click('button:has-text("Mark Complete")')

    // Should show confirmation dialog
    await page.click('button:has-text("Confirm")')

    // Should navigate back to lists
    await expect(page).toHaveURL('/dashboard/grocery-lists')

    // List should be marked as completed
    const completedList = page.locator('[data-testid=grocery-list-card]:has-text("Completed")')
    await expect(completedList).toBeVisible()
  })
})
