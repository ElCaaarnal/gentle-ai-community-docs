import { expect, test } from 'vitest';

test('the Node harness runs focused tests independently of the browser suite', () => {
  expect(process.release.name).toBe('node');
});
