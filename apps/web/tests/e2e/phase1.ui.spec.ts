import { test, expect } from '@playwright/test'

test('Phase 1 UI loads and shows header and panels', async ({ page }) => {
  // ensure app is up
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Phase 1 UI MVP Scaffold')
  await expect(page.locator('text=Tasks')).toBeVisible()
  await expect(page.locator('text=Catalog')).toBeVisible()
  await expect(page.locator('text=Agents')).toBeVisible()
})
