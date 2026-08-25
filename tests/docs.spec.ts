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

test('ecosystem uses localized headings with matching canonical IDs', async ({ page }) => {
  const sections = ['engram', 'sdd', 'openspec', 'tdd', 'skills'];
  const subsections = ['comandos-del-dia-a-dia', 'gestion-de-proyectos', 'como-funciona-la-deteccion-de-proyecto', 'compartir-con-el-equipo', 'herramientas-mcp-principales', 'las-diez-fases', 'donde-viven-los-artefactos', 'sub-agentes-mas-inteligentes-de-lo-que-parecen', 'que-se-puede-personalizar', 'que-fases-lo-referencian', 'ejemplo-de-estructura', 'inconsistencias-conocidas', 'dos-capas-de-skills', 'el-registro-de-skills'];

  for (const route of ['/', '/es/']) {
    await page.goto(route);
    expect(await page.locator('h2').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), sections)).toBe(true);
    expect(await page.locator('h3').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), subsections)).toBe(true);
  }

  await page.goto('/');
  await expect(page.locator('h2#engram')).toContainText('persistent memory');
  await expect(page.locator('h2#skills')).toContainText('skill registry');
  await page.goto('/es/');
  await expect(page.locator('h2#engram')).toContainText('memoria persistente');
  await expect(page.locator('h2#skills')).toContainText('registro de skills');
});

test('agent behavior uses localized headings with matching canonical IDs', async ({ page }) => {
  const ids = ['personas', 'ruteo', 'delegacion', 'estados', 'las-tres-rutas'];

  for (const route of ['/', '/es/']) {
    await page.goto(route);
    expect(await page.locator('[id]').evaluateAll((elements, expected) => expected.every((id) => elements.some((element) => element.id === id)), ids)).toBe(true);
  }

  await page.goto('/');
  await expect(page.locator('h2#ruteo')).toContainText('Organic implementation routing');
  await expect(page.locator('h3#las-tres-rutas')).toContainText('The three routes');
  await page.goto('/es/');
  await expect(page.locator('h2#ruteo')).toContainText('Ruteo orgánico de implementación');
  await expect(page.locator('h3#las-tres-rutas')).toContainText('Las tres rutas');
});

test('RDD uses localized headings with matching canonical IDs', async ({ page }) => {
  const sections = ['rdd', 'rdd-control', 'rdd-ciclo', 'rdd-lentes', 'rdd-correccion', 'rdd-entrega', 'rdd-limites', 'rdd-mantenimiento'];
  const subsections = ['el-modelo-en-tres-frases', '1-status-sin-selector-solo-hace-preflight', '2-start-congela-una-transaccion-independiente', '3-las-llamadas-atadas-manejan-la-transaccion', '4-la-aprobacion-quema-la-autoridad', 'continuidad-entre-repositorios', 'las-lentes-son-de-solo-lectura', 'la-forma-de-un-resultado-de-revisor', 'evidencia-independiente', 'proyecciones-del-candidato', 'codigos-de-parada', 'que-protege-el-modelo-de-amenazas-y-que-no', 'controles-retenidos', 'esquemas-de-entrada'];

  for (const route of ['/', '/es/']) {
    await page.goto(route);
    expect(await page.locator('h2').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), sections)).toBe(true);
    expect(await page.locator('h3').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), subsections)).toBe(true);
  }

  await page.goto('/');
  await expect(page.locator('h2#rdd')).toContainText('Receipt-Driven Development');
  await expect(page.locator('h3#el-modelo-en-tres-frases')).toContainText('The model in three sentences');
  await page.goto('/es/');
  await expect(page.locator('h2#rdd')).toContainText('RDD — Receipt-Driven Development');
  await expect(page.locator('h3#el-modelo-en-tres-frases')).toContainText('El modelo en tres frases');
});

test('complete workflows use localized server-rendered headings with equivalent Mermaid topology', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const ids = ['flujo-organico', 'flujo-sdd'];
  const topology = (source: string | null) => source?.replace(/"[^"]*"/g, '""').trim();

  await expectNoRedirect(page, '/');
  for (const id of ids) await expect(page.locator(`h2#${id}`)).toHaveCount(1);
  await expect(page.locator('h2#flujo-organico')).toContainText('Complete organic workflow');
  await expect(page.locator('h2#flujo-sdd')).toContainText('Complete SDD workflow');
  const englishTopology = await Promise.all(ids.map((id) => page.locator(`h2#${id} + p + .mermaid`).textContent()));

  await expectNoRedirect(page, '/es/');
  for (const id of ids) await expect(page.locator(`h2#${id}`)).toHaveCount(1);
  await expect(page.locator('h2#flujo-organico')).toContainText('Flujo orgánico completo');
  await expect(page.locator('h2#flujo-sdd')).toContainText('Flujo SDD completo');
  const spanishTopology = await Promise.all(ids.map((id) => page.locator(`h2#${id} + p + .mermaid`).textContent()));

  expect(englishTopology.map(topology)).toEqual(spanishTopology.map(topology));
  await context.close();
});

test('agents and Pi use localized headings with matching canonical IDs', async ({ page }) => {
  const sections = ['agentes', 'modelos-delegacion', 'perfiles', 'pi'];
  const subsections = ['soporte-de-sdd-multi-modo', 'notas-por-agente', 'instalacion-2', 'paquetes-que-instala', 'comandos-de-pi', 'asignacion-de-modelos-recomendada', 'archivos-de-proyecto', 'solucion-de-problemas'];
  const pathLiterals = ['~/.codex/<nombre>.config.toml', '~/.cursor/agents/sdd-{fase}.md'];

  for (const route of ['/', '/es/']) {
    await page.goto(route);
    expect(await page.locator('h2').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), sections)).toBe(true);
    expect(await page.locator('h3').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), subsections)).toBe(true);
    expect(await page.locator('[id]').evaluateAll((elements) => new Set(elements.map((element) => element.id)).size === elements.length)).toBe(true);
    expect(await page.locator('h2').evaluateAll((headings) => headings.findIndex((heading) => heading.id === 'pi') < headings.findIndex((heading) => heading.id === 'cli'))).toBe(true);
    for (const literal of pathLiterals) await expect(page.locator('code').filter({ hasText: literal })).toHaveCount(1);
  }

  await page.goto('/');
  await expect(page.locator('h2#agentes')).toContainText('Supported agent matrix');
  await expect(page.locator('h3#instalacion-2')).toContainText('Installation');
  await page.goto('/es/');
  await expect(page.locator('h2#agentes')).toContainText('Matriz de agentes compatibles');
  await expect(page.locator('h3#instalacion-2')).toContainText('Instalación');
});
