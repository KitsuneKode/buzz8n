/**
 * Playwright smoke E2E for buzz8n.
 *
 * Install: `bunx playwright install chromium`
 * Run (with web+api up): `bunx playwright test`
 *
 * These tests are intentionally light — they verify marketing + auth pages render.
 * Full signin → workflow → execute needs seeded credentials and is Phase 2+.
 */
import { test, expect } from '@playwright/test'

const APP_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

test.describe('buzz8n smoke', () => {
  test('marketing home loads', async ({ page }) => {
    await page.goto(APP_URL)
    await expect(page.locator('body')).toBeVisible()
  })

  test('signin page loads', async ({ page }) => {
    await page.goto(`${APP_URL}/signin`)
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('signup page loads', async ({ page }) => {
    await page.goto(`${APP_URL}/signup`)
    await expect(page.locator('body')).toBeVisible()
  })
})
