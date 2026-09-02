export type ReleaseFact = { readonly version: string; readonly released: string };

export const releases = {
  stable: { version: 'v2.5.0', released: '2026-09-01' },
} as const satisfies Record<'stable', ReleaseFact>;
