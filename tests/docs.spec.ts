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
  await expect(page.locator('h2#sdd-research')).toContainText('optional evidence');
  await expect(page.locator('h2#skills')).toContainText('skill registry');
  await page.goto('/es/');
  await expect(page.locator('h2#engram')).toContainText('memoria persistente');
  await expect(page.locator('h2#sdd-research')).toContainText('evidencia opcional');
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

test('cumulative v3 ODD and OpenCode contracts are localized and section-scoped', async ({ page }) => {
  const locales = [
    {
      path: '/',
      routing: ['ODD is the mandatory default protocol', 'SDD remains an explicitly selected workflow', 'odd/tasks/<feature>.md', 'Engram mirror', 'resolved configured TDD mode', 'exact runner', 'does not silently enable TDD', 'work-unit commit', 'last reviewed boundary', 'high-risk commits review immediately', 'medium-risk work accumulates into reviewable PR slices', 'Delegation stop rules table fires, delegation is mandatory'],
      delegation: ['Four-file rule', 'Multi-file writing rule', 'Incident rule', 'Long-session rule'],
      openCode: ['OpenCode V1 behavior remains unchanged', 'OpenCode V2 beta', 'native configuration handling', 'managed plugins', 'Unknown OpenCode versions fail closed', 'RDD review on OpenCode V2 remains unavailable', 'v3.4.0'],
    },
    {
      path: '/es/',
      routing: ['ODD es el protocolo predeterminado obligatorio', 'SDD sigue siendo un flujo seleccionado explícitamente', 'odd/tasks/<feature>.md', 'espejo en Engram', 'modo TDD configurado resuelto', 'runner exacto', 'no activa TDD silenciosamente', 'work-unit commit', 'último límite revisado', 'alto riesgo se revisan de inmediato', 'trabajo de riesgo medio se acumula en slices de PR revisables', 'delegar es obligatorio'],
      delegation: ['Regla de 4 archivos', 'Regla de escritura multiarchivo', 'Regla de incidente', 'Regla de sesión larga'],
      openCode: ['comportamiento de OpenCode V1 no cambia', 'OpenCode V2 beta', 'manejo nativo de configuración', 'plugins administrados', 'versiones desconocidas de OpenCode fallan de forma cerrada', 'RDD nativa en OpenCode V2 sigue sin estar disponible', 'v3.4.0'],
    },
  ];

  for (const locale of locales) {
    await page.goto(locale.path);
    const routingText = await page.locator('h2#ruteo').evaluate((heading) => {
      let text = '';
      for (let node: Element | null = heading; node; node = node.nextElementSibling) {
        if (node !== heading && node.tagName === 'H2') break;
        text += node.textContent ?? '';
      }
      return text;
    });
    for (const literal of locale.routing) expect(routingText).toContain(literal);

    const delegationText = await page.locator('h2#delegacion').evaluate((heading) => {
      let text = '';
      for (let node: Element | null = heading; node; node = node.nextElementSibling) {
        if (node !== heading && node.tagName === 'H2') break;
        text += node.textContent ?? '';
      }
      return text;
    });
    for (const literal of locale.delegation) expect(delegationText).toContain(literal);

    const openCodeNotes = page.locator('h4').filter({ hasText: 'OpenCode' }).locator('xpath=following-sibling::ul[1]');
    await expect(openCodeNotes).toHaveCount(1);
    for (const literal of locale.openCode) await expect(openCodeNotes).toContainText(literal);
  }
});

test('audit-aligned SDD context, research, TDD, and delegation contracts stay bilingual and scoped', async ({ page }) => {
  const locales = [
    {
      path: '/',
      context: ['Only an explicitly selected SDD workflow', 'does not enable Strict TDD', 'configuration or an explicit choice'],
      research: ['Research is optional read-only work', 'output-only evidence collector', 'does not read local artifacts or repository state', 'authorized tools', 'material claims link to source URLs', 'explicit gaps', 'does not create an SDD phase, contract, admission grant, persistence requirement, readiness gate, or proposal block'],
      tdd: ['configuration or an explicit choice', 'exact runner', 'RED → GREEN → REFACTOR', 'ordinary functional checks', 'Unknown or conflicting mode, or a missing runner'],
      delegation: ['mandatory, not advisory', '4 or more files', 'one bounded writer', 'Preparation trigger', 'Reading that prepares a write, broad research, or context compression', 'without any delegation', 'Route declaration', 'record the chosen route and trigger evidence per task', 'delegate a separate diagnosis', 'delegate the next bounded unit', 'fresh verification worker'],
      absent: ['gentle-ai.sdd-research/v1', 'sdd-research-capability/v1', 'proposal_ready'],
    },
    {
      path: '/es/',
      context: ['Solo un flujo SDD seleccionado explícitamente', 'no activa Strict TDD', 'configuración del proyecto/sesión o una elección explícita'],
      research: ['La investigación es trabajo opcional de solo lectura', 'colector de evidencia solo de salida', 'no lee artefactos locales ni estado del repositorio', 'herramientas que estén disponibles y autorizadas', 'los claims materiales enlazan URLs de fuentes', 'brechas explícitas', 'No crea una fase, contrato, grant de admisión, requisito de persistencia, gate de preparación ni bloqueo de propuesta de SDD'],
      tdd: ['configuración del proyecto/sesión o una elección explícita', 'runner exacto', 'RED → GREEN → REFACTOR', 'chequeos funcionales ordinarios', 'modo desconocido o conflictivo, o falta el runner'],
      delegation: ['obligatorios, no opcionales', '4 o más archivos', 'un solo escritor acotado', 'Regla de preparación', 'La lectura que prepara una escritura, la investigación amplia o la compresión de contexto', 'sin ninguna delegación', 'Declaración de ruta', 'registrar la ruta elegida y la evidencia del disparador por tarea', 'delegar un diagnóstico separado', 'delegar la próxima unidad acotada', 'worker fresco de verificación'],
      absent: ['gentle-ai.sdd-research/v1', 'sdd-research-capability/v1', 'proposal_ready'],
    },
  ];

  for (const locale of locales) {
    await page.goto(locale.path);
    const sectionText = async (id: string) => page.locator(`#${id}`).evaluate((heading) => {
      let text = '';
      for (let node: Element | null = heading; node; node = node.nextElementSibling) {
        if (node !== heading && node.tagName === 'H2') break;
        text += node.textContent ?? '';
      }
      return text;
    });

    for (const [id, literals] of Object.entries({ contexto: locale.context, 'sdd-research': locale.research, tdd: locale.tdd, delegacion: locale.delegation })) {
      const text = await sectionText(id);
      for (const literal of literals) expect(text).toContain(literal);
    }
    const research = await sectionText('sdd-research');
    for (const literal of locale.absent) expect(research).not.toContain(literal);
  }
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

test('RDD terminal acknowledgement and compact correction contracts stay bilingual and scoped', async ({ page }) => {
  const locales = [
    {
      path: '/',
      cycle: ['terminal capture → approved pending exact acknowledgement → acknowledgement burns authority', 'approved authority remains pending', 'Only the exact acknowledgement continuation burns the authority', 'exact acknowledgement burns only B', 'No compact receipt or delivery authority survives'],
      correction: ['0 for zero original lines', 'max(2, min(200, ceil(original_changed_lines / 2)))', 'formula remains only for historical and non-compact authority'],
      maintenance: ['Successful acknowledgement burns and removes approved authority', 'Retained, open, or degraded lineages can accumulate'],
      glossary: ['The terminal approved state pending its exact acknowledgement.', 'removal of the exact authority and its artifacts after the exact acknowledgement succeeds', 'not a compact receipt or delivery authority'],
      absent: ['approved + burn', 'burns its lineage directly', 'Approval burns only B', 'every candidate leaves a lineage behind'],
    },
    {
      path: '/es/',
      cycle: ['captura terminal → aprobado pendiente de acuse exacto → el acuse quema la autoridad', 'la autoridad aprobada queda pendiente', 'Solo la continuación de acuse exacta quema la autoridad', 'El acuse exacto quema solo B', 'No sobrevive ningún receipt compacto ni autoridad de entrega'],
      correction: ['0 para cero líneas originales', 'max(2, min(200, ceil(original_changed_lines / 2)))', 'queda para autoridad histórica y no compacta'],
      maintenance: ['El acuse exitoso quema y elimina la autoridad aprobada', 'Los linajes retenidos, abiertos o degradados pueden acumularse'],
      glossary: ['El estado terminal approved pendiente de su acuse exacto.', 'eliminación de la autoridad exacta y sus artefactos después de que el acuse exacto tiene éxito', 'No es un receipt compacto ni autoridad de entrega'],
      absent: ['aprobado + quema', 'quema su linaje directamente', 'La aprobación quema solo B', 'cada candidato deja un linaje atrás'],
    },
  ];

  const sectionText = async (id: string) => page.locator(`#${id}`).evaluate((heading) => {
    let text = '';
    for (let node: Element | null = heading; node; node = node.nextElementSibling) {
      if (node !== heading && node.tagName === 'H2') break;
      text += node.textContent ?? '';
    }
    return text;
  });

  for (const locale of locales) {
    await page.goto(locale.path);
    for (const [id, literals] of Object.entries({ 'rdd-ciclo': locale.cycle, 'rdd-correccion': locale.correction, 'rdd-mantenimiento': locale.maintenance, glosario: locale.glossary })) {
      const text = await sectionText(id);
      for (const literal of literals) expect(text).toContain(literal);
    }
    const cycle = await sectionText('rdd-ciclo');
    const maintenance = await sectionText('rdd-mantenimiento');
    for (const literal of locale.absent) {
      expect(cycle).not.toContain(literal);
      expect(maintenance).not.toContain(literal);
    }
  }
});

test('canonical ODD and SDD workflow contracts are localized and preserve shared IDs', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const locales = [
    {
      path: '/',
      oddStages: ['Authorize', 'Explore', 'Resolve uncertainty', 'Classify', 'Track before the first write', 'Implement task by task', 'Close'],
      routing: ['formal SDD artifacts only after an explicit request or an accepted proposal', 'When RDD is enabled'],
      absentRouting: ['The work has substantial ambiguity'],
      sdd: ['Verify is optional and does not gate Archive.', 'Archive can record unfinished work when the user chooses it.', 'SDD never invokes RDD.', 'Apply', 'Archive'],
      verifyArchiveEdges: ['Q -->|"reports findings"| R'],
      absentSdd: ['Optional RDD review offer'],
    },
    {
      path: '/es/',
      oddStages: ['Autorizar', 'Explorar', 'Resolver la incertidumbre', 'Clasificar', 'Registrar antes de la primera escritura', 'Implementar tarea por tarea', 'Cerrar'],
      routing: ['artefactos formales de SDD solo después de un pedido explícito o una propuesta aceptada', 'Cuando RDD está activado'],
      absentRouting: ['El trabajo tiene ambigüedad sustancial'],
      sdd: ['Verify es opcional y no bloquea Archive.', 'Archive puede registrar trabajo sin terminar cuando el usuario lo elige.', 'SDD nunca invoca RDD.', 'Apply', 'Archive'],
      verifyArchiveEdges: ['Q -->|"reporta findings"| R'],
      absentSdd: ['Oferta opcional de revisión RDD'],
    },
  ];

  for (const locale of locales) {
    await page.goto(locale.path);
    const routing = await page.locator('h2#ruteo').evaluate((heading) => {
      let text = '';
      for (let node: Element | null = heading; node; node = node.nextElementSibling) {
        if (node !== heading && node.tagName === 'H2') break;
        text += node.textContent ?? '';
      }
      return text;
    });
    for (const literal of locale.routing) expect(routing).toContain(literal);
    for (const literal of locale.absentRouting) expect(routing).not.toContain(literal);

    const oddWorkflow = await page.locator('h2#flujo-organico + p + .mermaid').textContent() ?? '';
    for (const stage of locale.oddStages) expect(oddWorkflow).toContain(stage);
    const sddWorkflow = (await Promise.all([
      page.locator('h2#flujo-sdd + p').textContent(),
      page.locator('h2#flujo-sdd + p + .mermaid').textContent(),
    ])).join('');
    for (const literal of locale.sdd) expect(sddWorkflow).toContain(literal);
    for (const edge of locale.verifyArchiveEdges) expect(sddWorkflow).toContain(edge);
    for (const literal of locale.absentSdd) expect(sddWorkflow).not.toContain(literal);
  }

  await context.close();
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
    expect(sources).toHaveLength(2);
    for (const source of sources) expect(source.trim().split('\n').length).toBeGreaterThan(10);
    perRoute.push(sources);

    await page.goto(route);
    const diagrams = page.locator('.mermaid');
    await expect(diagrams).toHaveCount(2);
    await expect(diagrams.nth(0).locator('svg')).toBeVisible();
    await expect(diagrams.nth(1).locator('svg')).toBeVisible();
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

test('Pi packages and commands stay current, bilingual, and section-scoped', async ({ page }) => {
  const locales = [
    {
      path: '/',
      current: ['pi install npm:gentle-pi', 'pi install npm:gentle-engram', 'pi install npm:pi-mcp-adapter', 'pi-engram init', 'pi install npm:@juicesharp/rpiv-ask-user-question', 'pi install npm:pi-web-access', 'pi install npm:pi-btw', 'Gentle Agents', 'subagent_* tools', 'retired', 'from settings.json on the next install or update', '/gentle:status', '/gentle:persona', '/gentle:models', '/gentle-sdd-init', '/gentle:install-sdd', '/gentle:install-sdd --force'],
      retiredPackagePolicy: ['pins gentle-pi below 2.5.0', 'keeps npm:pi-subagents-j0k3r', 'current or unpinned install, or a gentle-pi pin at 2.5.0 or later', 'removes npm:pi-subagents-j0k3r and npm:@juicesharp/rpiv-todo'],
      absent: ['rpiv-todo', '/gentle-ai:status', '/gentleman:persona', '/gentleman:models', '/sdd-init', '/gentle-ai:install-sdd', 'compatibility aliases'],
    },
    {
      path: '/es/',
      current: ['pi install npm:gentle-pi', 'pi install npm:gentle-engram', 'pi install npm:pi-mcp-adapter', 'pi-engram init', 'pi install npm:@juicesharp/rpiv-ask-user-question', 'pi install npm:pi-web-access', 'pi install npm:pi-btw', 'Gentle Agents', 'herramientas subagent_*', 'retirado', 'de settings.json en la próxima instalación o actualización', '/gentle:status', '/gentle:persona', '/gentle:models', '/gentle-sdd-init', '/gentle:install-sdd', '/gentle:install-sdd --force'],
      retiredPackagePolicy: ['fija gentle-pi por debajo de 2.5.0', 'conserva npm:pi-subagents-j0k3r', 'instalación actual o sin pin, o un pin de gentle-pi en 2.5.0 o posterior', 'elimina npm:pi-subagents-j0k3r y npm:@juicesharp/rpiv-todo'],
      absent: ['rpiv-todo', '/gentle-ai:status', '/gentleman:persona', '/gentleman:models', '/sdd-init', '/gentle-ai:install-sdd', 'alias de compatibilidad'],
    },
  ];

  for (const locale of locales) {
    await page.goto(locale.path);
    const pi = await page.locator('h2#pi').evaluate((heading) => {
      let text = '';
      for (let node: Element | null = heading; node; node = node.nextElementSibling) {
        if (node !== heading && node.tagName === 'H2') break;
        text += node.textContent ?? '';
      }
      return text;
    });
    const packageList = await page.locator('h3#paquetes-que-instala').evaluate((heading) => {
      for (let node = heading.nextElementSibling; node; node = node.nextElementSibling) {
        const pre = node.matches('pre') ? node : node.querySelector('pre');
        if (pre) return pre.textContent;
      }
      return null;
    });
    expect(packageList?.trim()).toBe([
      'pi install npm:gentle-pi',
      'pi install npm:gentle-engram',
      'pi install npm:pi-mcp-adapter',
      'npm exec --yes --package gentle-engram@latest -- pi-engram init',
      'pi install npm:@juicesharp/rpiv-ask-user-question',
      'pi install npm:pi-web-access',
      'pi install npm:pi-btw',
    ].join('\n'));
    for (const literal of locale.current) expect(pi).toContain(literal);
    for (const literal of locale.retiredPackagePolicy) expect(pi).toContain(literal);
    for (const literal of locale.absent) expect(packageList).not.toContain(literal);
    for (const literal of locale.absent.slice(1)) expect(pi).not.toContain(literal);
  }
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
  const versions = ['v3.4.0', '2026-09-19', '1.2.0'];
  const formula = 'min(200, ceil(original_changed_lines / 2))';
  const bound = {
    stable: { version: 'v3.4.0', released: '2026-09-19' },
  };
  const glossary = ['Candidate', 'Lineage', 'Approval', 'Receipt', 'Lens', 'Burn', 'Projection', 'Gate', 'Candidate-caused finding', 'Correction budget', 'Delta-spec', 'Escalated'];
  const spanishGlossary = ['Candidato', 'Linaje', 'Aprobación', 'Receipt', 'Lente', 'Quema', 'Proyección', 'Gate', 'Finding causado por el candidato', 'Presupuesto de corrección', 'Delta-spec', 'Escalado'];
  const officialLinks = [
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/intended-usage.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/trigger-rules.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/architecture/organic-rdd.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/review-integration.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/review-authority-threat-model.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/agents.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/pi.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/openspec-config.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/engram.md',
    'https://github.com/Gentleman-Programming/gentle-ai/blob/v3.4.0/docs/rollback.md',
    'https://the-amazing-gentleman-programming-book.vercel.app/en/book/Chapter21_Verifiable-Trust',
    'https://github.com/Gentleman-Programming/gentle-ai',
  ];

  for (const route of ['/', '/es/']) {
    await page.goto(route);
    for (const id of ids) await expect(page.locator(`h2#${id}`)).toHaveCount(1);
    for (const literal of [...versions, formula]) await expect(page.locator('main')).toContainText(literal);

    // The upgrade notes are an h3 inside #versiones on purpose: an h2 would change the
    // section count that scripts/build-mcp-index.mjs and the section scans above pin.
    const upgrade = page.locator('h3#actualizar-a-v3-4-0');
    const releaseNotes = upgrade.locator('xpath=following-sibling::*[self::p or self::ul][position() <= 5]');
    await expect(upgrade).toHaveCount(1);
    const releaseText = (await releaseNotes.allTextContents()).join(' ');
    const localizedReleaseLiterals = route === '/'
      ? ['Pi refuter and validator roles are host-mediated.', 'the RTK integration is retired.']
      : ['Los roles de refutador y validador de Pi pasan a estar mediados por el host.', 'se retira la integración RTK.'];
    for (const literal of ['review_due', 'next_transition', '200 KiB', 'OpenCode', 'VictoriaMetrics', 'v2.1.154', 'gentle-ai sync', ...localizedReleaseLiterals]) {
      expect(releaseText).toContain(literal);
    }

    // Double-entry against src/data/versions.ts. These expectations are authored here by
    // hand and MUST NOT be imported from that module, or the assertion becomes a tautology.
    // Scoped to the bound regions on purpose: asserting over `main` cannot detect drift,
    // because the same literals also appear in authored prose that stays authored.
    const channels = page.locator('h2#versiones ~ .tblwrap').first();
    for (const region of [page.locator('.hero .meta'), channels]) {
      await expect(region).toContainText(bound.stable.version);
    }
    await expect(channels).toContainText(bound.stable.released);

    // The prerelease channel is removed while no candidate line is open. Asserting its
    // absence — rather than dropping the old expectations — keeps the same double-entry
    // guard pointing at the current shape: a stale RC row or hero chip reappearing in
    // either locale fails here instead of shipping a candidate that does not exist.
    await expect(channels.locator('tbody tr')).toHaveCount(2);
    for (const region of [page.locator('.hero .meta'), channels]) {
      await expect(region).not.toContainText('-rc.');
    }
    await expect(page.locator('main')).not.toContainText('gentle-ai@v2.');
    await expect(page.locator('h2#docs + .tblwrap a')).toHaveCount(officialLinks.length);
    for (const href of officialLinks) {
      const link = page.locator(`h2#docs + .tblwrap a[href="${href}"]`);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener');
    }
  }

  await page.goto('/');
  await expect(page.locator('h2#versiones')).toContainText('Version policy');
  await expect(page.locator('h3#actualizar-a-v3-4-0')).toContainText('Upgrading to v3.4.0');
  await expect(page.locator('h2#glosario')).toContainText('Glossary');
  await expect(page.locator('h2#docs')).toContainText('Official documentation');
  await expect(page.locator('h2#glosario + dl dt').allTextContents()).resolves.toEqual(glossary.map((term) => expect.stringContaining(term)));
  await expect(page.locator('main')).not.toContainText('Política de versiones');
  await expect(page.locator('main')).not.toContainText('Documentación oficial');

  await page.goto('/es/');
  await expect(page.locator('h2#versiones')).toContainText('Política de versiones');
  await expect(page.locator('h3#actualizar-a-v3-4-0')).toContainText('Actualizar a v3.4.0');
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
