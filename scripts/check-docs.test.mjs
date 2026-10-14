import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkLocalLinks } from './check-docs.mjs';

test('checks local links without fetching external URLs or treating code examples as links', async () => {
  const root = await mkdtemp(join(tmpdir(), 'peekaplate-docs-'));
  try {
    await writeFile(join(root, 'target.md'), '# Target');
    await writeFile(
      join(root, 'index.md'),
      '[ok](target.md#target) [web](https://example.invalid)\n```md\n[example](absent.md)\n```',
    );
    await checkLocalLinks(root, ['index.md']);
    await writeFile(join(root, 'index.md'), '[broken](missing.md)');
    await assert.rejects(checkLocalLinks(root, ['index.md']), /index.md: missing missing.md/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
