export type Locale = 'en' | 'es';
type NavigationGroup = readonly [string, readonly [string, string][]];
export type SiteCopy = { lang: Locale; title: string; description: string; tagline: string; menu: string; search: string; searchDocumentation: string; searchPlaceholder: string; searchResults: string; skipToContent: string; backToTop: string; navigation: string; language: string; navigationGroups: readonly NavigationGroup[] };

const navigation = {
  en: [
    ['Get started', [['que-es', 'What is Gentle AI'], ['instalacion', 'Installation'], ['contexto', 'Project context'], ['presets', 'Components and presets']]],
    ['The ecosystem', [['engram', 'Engram · memory'], ['sdd', 'SDD · specification-driven development'], ['openspec', 'OpenSpec · config.yaml'], ['tdd', 'Strict TDD'], ['skills', 'Skills and registry'], ['personas', 'Personas']]],
    ['How the agent works', [['ruteo', 'Organic routing'], ['delegacion', 'Delegation rules'], ['estados', 'Public states']]],
    ['RDD · review', [['rdd', 'What is RDD'], ['rdd-control', 'Enable and disable RDD'], ['rdd-ciclo', 'The atomic cycle'], ['rdd-lentes', 'Risk and lenses'], ['rdd-correccion', 'Bounded correction'], ['rdd-entrega', 'Delivery and gates'], ['rdd-limites', 'Confidence boundaries'], ['rdd-mantenimiento', 'Store maintenance']]],
    ['Complete workflows', [['flujo-organico', 'Organic workflow'], ['flujo-sdd', 'SDD workflow']]],
    ['Agents', [['agentes', 'Agent matrix'], ['modelos-delegacion', 'Delegation models'], ['perfiles', 'OpenCode profiles'], ['pi', 'Pi and gentle-pi']]],
    ['Operations', [['cli', 'CLI reference'], ['backups', 'Backups and rollback'], ['releases', 'Release verification'], ['versiones', 'Version policy']]],
    ['Reference', [['glosario', 'Glossary'], ['docs', 'Official documentation']]],
  ],
  es: [
    ['Empezar', [['que-es', 'Qué es Gentle AI'], ['instalacion', 'Instalación'], ['contexto', 'Contexto del proyecto'], ['presets', 'Componentes y presets']]],
    ['El ecosistema', [['engram', 'Engram · memoria'], ['sdd', 'SDD · desarrollo por especificación'], ['openspec', 'OpenSpec · config.yaml'], ['tdd', 'Strict TDD'], ['skills', 'Skills y registro'], ['personas', 'Personas']]],
    ['Cómo trabaja el agente', [['ruteo', 'Ruteo orgánico'], ['delegacion', 'Reglas de delegación'], ['estados', 'Estados públicos']]],
    ['RDD · revisión', [['rdd', 'Qué es RDD'], ['rdd-control', 'Prender y apagar RDD'], ['rdd-ciclo', 'El ciclo atómico'], ['rdd-lentes', 'Riesgo y lentes'], ['rdd-correccion', 'Corrección acotada'], ['rdd-entrega', 'Entrega y gates'], ['rdd-limites', 'Límites de confianza'], ['rdd-mantenimiento', 'Mantenimiento del store']]],
    ['Flujos completos', [['flujo-organico', 'Flujo orgánico'], ['flujo-sdd', 'Flujo SDD']]],
    ['Agentes', [['agentes', 'Matriz de agentes'], ['modelos-delegacion', 'Modelos de delegación'], ['perfiles', 'Perfiles OpenCode'], ['pi', 'Pi y gentle-pi']]],
    ['Operación', [['cli', 'Referencia de CLI'], ['backups', 'Backups y rollback'], ['releases', 'Verificación de releases'], ['versiones', 'Política de versiones']]],
    ['Referencia', [['glosario', 'Glosario'], ['docs', 'Documentación oficial']]],
  ],
} as const satisfies Record<Locale, readonly NavigationGroup[]>;

export const site: Record<Locale, SiteCopy> = {
  en: {
    lang: 'en',
    title: 'Gentle AI Documentation',
    description: 'Gentle AI documentation: installation, supported agents, Engram, SDD, OpenSpec, Strict TDD, skills, and bounded review (RDD).',
    tagline: 'An ecosystem, frameworks, and workflows for AI coding agents.',
    menu: 'Open navigation', search: 'Search', searchDocumentation: 'Search documentation', searchPlaceholder: 'Search sections, commands, concepts…', searchResults: 'Results', skipToContent: 'Skip to content', backToTop: 'Back to top', navigation: 'Documentation sections', language: 'Language', navigationGroups: navigation.en,
  },
  es: {
    lang: 'es',
    title: 'Documentación de Gentle AI',
    description: 'Documentación de Gentle AI: instalación, agentes soportados, Engram, SDD, OpenSpec, Strict TDD, skills y revisión acotada (RDD).',
    tagline: 'Ecosistema, frameworks y flujos de trabajo para agentes de IA que escriben código.',
    menu: 'Abrir navegación', search: 'Buscar', searchDocumentation: 'Buscar en la documentación', searchPlaceholder: 'Buscar secciones, comandos, conceptos…', searchResults: 'Resultados', skipToContent: 'Saltar al contenido', backToTop: 'Volver arriba', navigation: 'Secciones de la documentación', language: 'Idioma', navigationGroups: navigation.es,
  },
};
