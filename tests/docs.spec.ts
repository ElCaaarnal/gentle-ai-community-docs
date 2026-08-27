import { expect, test } from '@playwright/test';

async function expectNoRedirect(page: import('@playwright/test').Page, path: string) {
  const response = await page.goto(path);

  expect(response?.status()).toBe(200);
  expect(response?.request().redirectedFrom()).toBeNull();
}

async function openLocaleSwitcher(page: import('@playwright/test').Page) {
  const menu = page.locator('#menuBtn');
  if (await menu.isVisible()) await menu.click();
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

test('a valid H2 or H3 fragment survives a locale switch and receives focus', async ({ page }) => {
  await page.goto('/#rdd-ciclo');
  await openLocaleSwitcher(page);
  await page.getByRole('link', { name: 'Español', exact: true }).click();

  await expect(page).toHaveURL(/\/es\/#rdd-ciclo$/);
  await expect(page.locator('#rdd-ciclo')).toBeFocused();
});

test('unknown or encoded fragments fall back to a usable alternate route and main content', async ({ page }) => {
  await page.goto('/#unknown%20fragment');
  await openLocaleSwitcher(page);
  await page.getByRole('link', { name: 'Español', exact: true }).click();

  await expect(page).toHaveURL(/\/es\/$/);
  await expect(page.locator('main')).toBeVisible();
});

test('locale pages isolate prose and expose locale-correct SEO and language controls', async ({ page }) => {
  const locales = [
    { path: '/', lang: 'en', canonical: 'https://docs-gentle-ai.netlify.app/', title: 'Gentle AI Documentation', current: 'English', inactive: 'Español', unwanted: ['Documentación de Gentle AI', 'Qué es Gentle AI', 'Lo primero que hay que entender'] },
    { path: '/es/', lang: 'es', canonical: 'https://docs-gentle-ai.netlify.app/es/', title: 'Documentación de Gentle AI', current: 'Español', inactive: 'English', unwanted: ['Gentle AI Documentation', 'What is Gentle AI', 'The first thing to understand'] },
  ];

  for (const locale of locales) {
    await page.goto(locale.path);
    await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', locale.canonical);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://docs-gentle-ai.netlify.app/');
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute('href', 'https://docs-gentle-ai.netlify.app/es/');
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', 'https://docs-gentle-ai.netlify.app/');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', locale.canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://docs-gentle-ai.netlify.app/banner.webp');
    await expect(page.locator('.language-switcher')).toHaveAccessibleName(locale.lang === 'en' ? 'Language' : 'Idioma');
    await expect(page.getByRole('link', { name: locale.current, exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: locale.inactive, exact: true })).not.toHaveAttribute('aria-current', 'page');
    await expect(page.locator('h1')).toContainText(locale.title);
    expect(await page.locator('[id]').evaluateAll((elements) => new Set(elements.map((element) => element.id)).size === elements.length)).toBe(true);
    for (const text of locale.unwanted) await expect(page.locator('main')).not.toContainText(text);
  }
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
  const sections = ['engram', 'sdd', 'sdd-research', 'openspec', 'tdd', 'skills'];
  const subsections = ['comandos-del-dia-a-dia', 'gestion-de-proyectos', 'como-funciona-la-deteccion-de-proyecto', 'compartir-con-el-equipo', 'herramientas-mcp-principales', 'las-diez-fases', 'donde-viven-los-artefactos', 'sub-agentes-mas-inteligentes-de-lo-que-parecen', 'como-se-declara', 'que-persiste', 'la-compuerta-de-propuesta', 'que-se-puede-personalizar', 'que-fases-lo-referencian', 'ejemplo-de-estructura', 'inconsistencias-conocidas', 'dos-capas-de-skills', 'el-registro-de-skills'];

  for (const route of ['/', '/es/']) {
    await page.goto(route);
    expect(await page.locator('h2').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), sections)).toBe(true);
    expect(await page.locator('h3').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), subsections)).toBe(true);
  }

  await page.goto('/');
  await expect(page.locator('h2#engram')).toContainText('persistent memory');
  await expect(page.locator('h2#sdd-research')).toContainText('evidence lane');
  await expect(page.locator('h2#skills')).toContainText('skill registry');
  await page.goto('/es/');
  await expect(page.locator('h2#engram')).toContainText('memoria persistente');
  await expect(page.locator('h2#sdd-research')).toContainText('vía de evidencia');
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

test('every Mermaid diagram keeps its statement separators and renders an SVG', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const sourcePage = await context.newPage();
  const perRoute: string[][] = [];

  for (const route of ['/', '/es/']) {
    await sourcePage.goto(route);
    const sources = await sourcePage.locator('.mermaid').evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''));

    // Mermaid separates flowchart statements by newline, so the build must never collapse them.
    expect(sources).toHaveLength(3);
    for (const source of sources) expect(source.trim().split('\n').length).toBeGreaterThan(10);
    perRoute.push(sources);

    await page.goto(route);
    const diagrams = page.locator('.mermaid');
    await expect(diagrams).toHaveCount(3);
    await expect(diagrams.nth(0).locator('svg')).toBeVisible();
    await expect(diagrams.nth(1).locator('svg')).toBeVisible();
    await expect(diagrams.nth(2).locator('svg')).toBeVisible();
    await expect(diagrams.filter({ hasText: 'Syntax error' })).toHaveCount(0);
  }

  const topology = (source: string) => source.replace(/"[^"]*"/g, '""').trim();
  expect(perRoute[0].map(topology)).toEqual(perRoute[1].map(topology));

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

test('operations use localized headings, shared IDs, and literal boundaries', async ({ page }) => {
  const sections = ['cli', 'backups', 'releases'];
  const subsections = ['tui-interactiva', 'install', 'sync', 'uninstall', 'update-upgrade', 'doctor', 'flujo-de-trabajo-tipico', 'como-funciona', 'contenido-del-snapshot', 'politica-de-retencion', 'gestion-desde-la-tui', 'comportamiento-de-restauracion', 'si-la-verificacion-falla'];
  const literals = ['--component sdd,persona,context7', 'nombre:proveedor/modelo', 'nombre:fase:proveedor/modelo', 'checksums.txt', 'checksums.txt.minisig', 'Gentleman-Programming/gentle-ai'];

  for (const route of ['/', '/es/']) {
    await page.goto(route);
    expect(await page.locator('h2').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), sections)).toBe(true);
    expect(await page.locator('h3').evaluateAll((headings, ids) => ids.every((id) => headings.some((heading) => heading.id === id)), subsections)).toBe(true);
    expect(await page.locator('[id]').evaluateAll((elements) => new Set(elements.map((element) => element.id)).size === elements.length)).toBe(true);
    const operationText = await page.locator('h2#cli').evaluate((heading) => {
      let text = '';
      for (let node: Element | null = heading; node; node = node.nextElementSibling) {
        if (node !== heading && node.tagName === 'H2' && (node.id === 'versiones' || node.id === 'glosario')) break;
        text += node.textContent ?? '';
      }
      return text;
    });
    for (const literal of literals) expect(operationText).toContain(literal);
  }

  await page.goto('/');
  await expect(page.locator('h2#cli')).toContainText('CLI reference');
  await expect(page.locator('h2#backups')).toContainText('Backups and rollback');
  await page.goto('/es/');
  await expect(page.locator('h2#cli')).toContainText('Referencia de CLI');
  await expect(page.locator('h2#backups')).toContainText('Backups y rollback');
});

test('version policy and reference content is localized with exact shared literals', async ({ page }) => {
  const ids = ['versiones', 'glosario', 'docs'];
  const versions = ['v1.47.0', 'v2.1.6', 'v2.2.0', 'v2.4.0', 'v2.4.0-rc.8', 'v2.5.0-rc.1', '2026-07-10', '2026-08-17', '2026-08-14', '2026-08-26'];
  const formula = 'min(200, ceil(original_changed_lines / 2))';
  const glossary = ['Candidate', 'Lineage', 'Receipt', 'Lens', 'Burn', 'Projection', 'Gate', 'Candidate-caused finding', 'Correction budget', 'Delta-spec', 'Escalated'];
  const spanishGlossary = ['Candidato', 'Linaje', 'Receipt', 'Lente', 'Quema', 'Proyección', 'Gate', 'Finding causado por el candidato', 'Presupuesto de corrección', 'Delta-spec', 'Escalado'];
  const officialLinks = [
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/intended-usage.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/trigger-rules.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/architecture/organic-rdd.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/review-integration.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/review-authority-threat-model.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/agents.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/pi.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/openspec-config.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/engram.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/rollback.md',
    'https://the-amazing-gentleman-programming-book.vercel.app/en/book/Chapter21_Verifiable-Trust',
    'https://github.com/Gentleman-Programming/gentle-ai',
  ];

  for (const route of ['/', '/es/']) {
    await page.goto(route);
    for (const id of ids) await expect(page.locator(`h2#${id}`)).toHaveCount(1);
    for (const literal of [...versions, formula]) await expect(page.locator('main')).toContainText(literal);
    await expect(page.locator('h2#docs + .tblwrap a')).toHaveCount(officialLinks.length);
    for (const href of officialLinks) {
      const link = page.locator(`h2#docs + .tblwrap a[href="${href}"]`);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener');
    }
  }

  await page.goto('/');
  await expect(page.locator('h2#versiones')).toContainText('Version policy');
  await expect(page.locator('h2#glosario')).toContainText('Glossary');
  await expect(page.locator('h2#docs')).toContainText('Official documentation');
  await expect(page.locator('h2#glosario + dl dt').allTextContents()).resolves.toEqual(glossary.map((term) => expect.stringContaining(term)));
  await expect(page.locator('main')).not.toContainText('Política de versiones');
  await expect(page.locator('main')).not.toContainText('Documentación oficial');

  await page.goto('/es/');
  await expect(page.locator('h2#versiones')).toContainText('Política de versiones');
  await expect(page.locator('h2#glosario')).toContainText('Glosario');
  await expect(page.locator('h2#docs')).toContainText('Documentación oficial');
  await expect(page.locator('h2#glosario + dl dt').allTextContents()).resolves.toEqual(spanishGlossary.map((term) => expect.stringContaining(term)));
});

test('browser matrix keeps locale behavior, search, scrollspy, focus, tables, and visual surfaces stable', async ({ page }, testInfo) => {
  const locales = [
    { path: '/', search: 'What is Gentle AI', heading: 'What is Gentle AI', noResults: 'No results' },
    { path: '/es/', search: 'Qué es Gentle AI', heading: 'Qué es Gentle AI', noResults: 'Sin resultados' },
  ];
  const narrow = testInfo.project.name === 'chromium-narrow';
  const sitemapIndex = await page.request.get('/sitemap-index.xml');
  expect(sitemapIndex.status()).toBe(200);
  await expect(sitemapIndex.text()).resolves.toContain('sitemap-0.xml');
  const sitemap = await page.request.get('/sitemap-0.xml');
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain('https://docs-gentle-ai.netlify.app/');
  expect(sitemapText).toContain('https://docs-gentle-ai.netlify.app/es/');

  for (const locale of locales) {
    await page.goto(locale.path);
    await expect(page.locator('.hero img')).toHaveAttribute('src', '/banner.webp');
    await page.locator(narrow ? '#searchBtnM' : '#searchBtn').click();
    await expect(page.locator('#searchResults .hit')).not.toHaveCount(0);
    await page.locator('#searchInput').fill(locale.search);
    await expect(page.locator('#searchResults .hit')).toContainText(locale.heading);
    await page.locator('#searchInput').fill('not-a-documentation-match');
    await expect(page.locator('#searchResults .empty')).toHaveText(locale.noResults);
    await page.keyboard.press('Escape');

    await page.locator('#rdd').evaluate((heading) => window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - 120));
    await expect(page.locator('#nav > a[href="#rdd"]')).toHaveClass(/active/);
    await page.goto(`${locale.path}#rdd-ciclo`);
    await expect(page.locator('#rdd-ciclo')).toBeFocused();
    await expect(page.locator('.tblwrap td[data-label]').first()).toBeVisible();

    if (narrow) {
      // The card-mode requirement is structural, so assert it directly instead of
      // photographing it: a pixel capture of this table tracked the text length of
      // the whole page above it and moved on every unrelated edit.
      const table = page.locator('h2#docs + .tblwrap table');
      await expect(table.locator('thead')).toBeHidden();
      await expect(table.locator('tbody tr').first()).toHaveCSS('display', 'block');
      const headers = await table.locator('thead th').allTextContents();
      const labels = await table.locator('tbody tr').first().locator('td').evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-label')));
      expect(labels).toEqual(headers.map((header) => header.trim()));
    } else {
      await expect(page.locator('h2#docs + .tblwrap thead')).toBeVisible();
      await expect(page.locator('h2#docs + .tblwrap tbody tr').first()).toHaveCSS('display', 'table-row');
      await expect(page.locator('.hero')).toHaveScreenshot(`hero-${locale.path === '/' ? 'en' : 'es'}.png`, { animations: 'disabled' });
    }
  }
});
