import { gzipSync } from 'node:zlib';

export function checkInitialBundle(bundle, limit = 150_000) {
  const pending = Object.values(bundle)
    .filter((part) => part.type === 'chunk' && part.isEntry)
    .map((part) => part.fileName);
  const visited = new Set();
  let gzipBytes = 0;
  while (pending.length) {
    const name = pending.pop();
    if (visited.has(name)) continue;
    visited.add(name);
    const chunk = bundle[name];
    if (chunk?.type !== 'chunk') throw new Error(`Missing initial JS chunk: ${name}`);
    for (const module of Object.keys(chunk.modules)) {
      if (
        /(?:^|[/\\])(?:three|@react-three|@sparkjsdev|@google[/\\]model-viewer)(?:[/\\]|$)/.test(
          module,
        )
      )
        throw new Error(`Renderer in initial diner graph: ${module}`);
    }
    gzipBytes += gzipSync(chunk.code).length;
    pending.push(...chunk.imports.filter((name) => name in bundle));
  }
  if (!visited.size) throw new Error('No diner entry chunk found');
  if (gzipBytes > limit)
    throw new Error(`Initial diner JS ${gzipBytes} gzip bytes exceeds ${limit}`);
  return { chunks: visited.size, gzipBytes, limit };
}

export function dinerBudget() {
  return {
    name: 'peekaplate-diner-budget',
    generateBundle(_options, bundle) {
      console.log(`Diner initial JS: ${JSON.stringify(checkInitialBundle(bundle))}`);
    },
  };
}
