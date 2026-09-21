export type ReleaseFact = { readonly version: string; readonly released: string };

export const releases = {
  stable: { version: 'v3.4.0', released: '2026-09-19' },
} as const satisfies Record<'stable', ReleaseFact>;
