import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkGraph, fingerprint, readGraph, validateGraph } from './context.mjs';

const node = () => ({
  id: 'api',
  status: 'foundation',
  summary: 'Health endpoint only',
  paths: ['api.ts'],
  adrs: [],
  dependsOn: [],
  sourceFingerprint: '',
});
const graph = () => ({ schemaVersion: 1, nodes: [node()], handoffs: [] });

test('rejects malformed, duplicated, unsafe and cyclic context', () => {
  assert.throws(() => readGraph('No JSON block'));
  assert.throws(() => readGraph('```json\n{}\n```\n```json\n{}\n```'));
  const duplicate = graph();
  duplicate.nodes.push(node());
  assert.throws(() => validateGraph(duplicate), /duplicate/);
  const unsafe = graph();
  unsafe.nodes[0].paths = ['../secrets'];
  assert.throws(() => validateGraph(unsafe), /unsafe/);
  const missing = graph();
  missing.nodes[0].dependsOn = ['missing'];
  assert.throws(() => validateGraph(missing), /dependency/);
  const cyclic = graph();
  cyclic.nodes.push({ ...node(), id: 'other', dependsOn: ['api'] });
  cyclic.nodes[0].dependsOn = ['other'];
  assert.throws(() => validateGraph(cyclic), /cycle/);
});

test('detects stale or missing sources while tolerating checkout line endings', async () => {
  const root = await mkdtemp(join(tmpdir(), 'peekaplate-context-'));
  try {
    const state = graph();
    await writeFile(join(root, 'api.ts'), 'health\n');
    state.nodes[0].sourceFingerprint = await fingerprint(root, state.nodes[0]);
    await checkGraph(root, state);
    await writeFile(join(root, 'api.ts'), 'health\r\n');
    await checkGraph(root, state);
    await writeFile(join(root, 'api.ts'), 'new behavior\n');
    await assert.rejects(checkGraph(root, state), /stale/);
    state.nodes[0].paths = ['missing.ts'];
    await assert.rejects(checkGraph(root, state), /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
