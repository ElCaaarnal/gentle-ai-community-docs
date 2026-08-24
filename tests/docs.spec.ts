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

test('getting started uses localized headings with matching canonical IDs', async ({ page }) => {
  const sections = ['que-es', 'instalacion', 'contexto', 'presets'];
  const subsections = ['la-regla-de-oro', 'requisitos-previos', 'macos-linux', 'homebrew', 'go-install', 'alcance-de-instalacion', 'componentes', 'presets-list'];

  for (const route of ['/', '/es/']) {
    await page.goto(route);
    expect(await page.locator('h2').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), sections)).toBe(true);
    expect(await page.locator('h3').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), subsections)).toBe(true);
  }

  await page.goto('/');
  await expect(page.locator('h2#que-es')).toContainText('What is Gentle AI');
  await page.goto('/es/');
  await expect(page.locator('h2#que-es')).toContainText('Qué es Gentle AI');
});
