export type ReleaseFact = { readonly version: string; readonly released: string };

const goModulePath = 'github.com/gentleman-programming/gentle-ai/v2/cmd/gentle-ai';

export const releases = {
  stable: { version: 'v2.4.0', released: '2026-08-17' },
  prerelease: { version: 'v2.5.0-rc.1', released: '2026-08-26' },
} as const satisfies Record<'stable' | 'prerelease', ReleaseFact>;

export const prereleaseInstall = `go install ${goModulePath}@${releases.prerelease.version}`;
