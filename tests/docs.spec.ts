import { expect, test } from '@playwright/test';

async function expectNoRedirect(page: import('@playwright/test').Page, path: string) {
  const response = await page.goto(path);

  expect(response?.status()).toBe(200);
  expect(response?.request().redirectedFrom()).toBeNull();
}

test('locale links have usable no-JavaScript base routes without redirects', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await expectNoRedirect(page, '/');
  await expect(page.getByRole('link', { name: 'Español', exact: true })).toHaveAttribute('href', '/es/');

  await expectNoRedirect(page, '/es/');
  await expect(page.getByRole('link', { name: 'English', exact: true })).toHaveAttribute('href', '/');
  await expect(page.locator('main')).toBeVisible();
  await context.close();
});

test.fail('a valid H2 or H3 fragment survives a locale switch and receives focus', async ({ page }) => {
  await page.goto('/#rdd-ciclo');
  await page.getByRole('link', { name: 'Español', exact: true }).click();

  await expect(page).toHaveURL(/\/es\/#rdd-ciclo$/);
  await expect(page.locator('#rdd-ciclo')).toBeFocused();
});

test('unknown or encoded fragments fall back to a usable alternate route and main content', async ({ page }) => {
  await page.goto('/#unknown%20fragment');
  await page.getByRole('link', { name: 'Español', exact: true }).click();

  await expect(page).toHaveURL(/\/es\/$/);
  await expect(page.locator('main')).toBeVisible();
});
