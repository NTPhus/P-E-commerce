import { test, expect } from '@playwright/test'

test('Admin dashboard loads', async ({ page }) => {
  // Admin UI assumed to run on port 5174
  await page.goto('http://localhost:5174/admin')
  await expect(page.locator('h2')).toHaveText('Admin Dashboard')
  // Ensure there is at least one chart (SVG)
  await expect(page.locator('svg')).toBeVisible()
})
