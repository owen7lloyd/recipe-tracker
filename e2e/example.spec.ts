import { test, expect } from '@playwright/test'

/**
 * Basic smoke test to verify the app is running
 */
test.describe('Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Check that the page loaded with the correct title
    await expect(page).toHaveTitle(/Recipe.*Pantry.*Tracker/)
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Should be able to navigate to login or dashboard
    const hasLogin = await page.locator('a[href*="login"], button:has-text("Sign in")').count()
    const hasDashboard = await page.locator('a[href*="dashboard"]').count()

    expect(hasLogin + hasDashboard).toBeGreaterThan(0)
  })
})
