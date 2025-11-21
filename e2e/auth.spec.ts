import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 * Tests user registration, login, and authentication flows
 */

test.describe('Authentication Flow', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Should redirect to login or show login option
    await expect(page).toHaveURL(/\/(login)?/)
  })

  test.skip('should register a new user', async ({ page }) => {
    // This test requires the test to create a unique email each time
    // Skipping for now until we set up proper test data management

    await page.goto('/register')

    const uniqueEmail = `test-${Date.now()}@example.com`
    await page.fill('[name=email]', uniqueEmail)
    await page.fill('[name=password]', 'Password123!')
    await page.fill('[name=name]', 'Test User')
    await page.fill('[name=householdName]', 'Test Household')

    await page.click('button[type=submit]')

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard')
  })

  test.skip('should login existing user', async ({ page }) => {
    // This requires a test user to exist
    // Skipping until test data setup is complete

    await page.goto('/login')
    await page.fill('[name=email]', 'test@example.com')
    await page.fill('[name=password]', 'password123')
    await page.click('button[type=submit]')

    await expect(page).toHaveURL('/dashboard')
  })

  test.skip('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name=email]', 'invalid@example.com')
    await page.fill('[name=password]', 'wrongpassword')
    await page.click('button[type=submit]')

    // Should show error message
    await expect(page.locator('text=/Invalid.*credentials/i')).toBeVisible()
  })
})
