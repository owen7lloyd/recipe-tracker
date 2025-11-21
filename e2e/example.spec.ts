import { test, expect } from '@playwright/test'

/**
 * Example E2E test - this will be replaced with actual tests
 */
test.describe('Example Test Suite', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Check that the page loaded
    await expect(page).toHaveTitle(/Recipe Tracker/)
  })
})
