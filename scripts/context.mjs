import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function readGraph(markdown) {
  const blocks = [...markdown.matchAll(/```json\s*\n([\s\S]*?)\n```/g)];
  if (blocks.length !== 1) throw new Error('CONTEXT.md must contain exactly one JSON block');
  return JSON.parse(blocks[0][1]);
}

export function validateGraph(graph) {
  if (graph.schemaVersion !== 1 || !Array.isArray(graph.nodes) || !graph.nodes.length) {
    throw new Error('Context requires schemaVersion 1 and nonempty nodes');
  }
  const ids = new Set();
  for (const node of graph.nodes) {
    if (!/^[a-z][a-z0-9-]*$/.test(node.id) || ids.has(node.id))
      throw new Error('Invalid or duplicate node ID');
    ids.add(node.id);
    if (typeof node.summary !== 'string' || !node.summary.trim() || node.summary.length > 1000)
      throw new Error(`${node.id}: invalid summary`);
    if (!['foundation', 'implemented', 'planned'].includes(node.status))
      throw new Error(`${node.id}: invalid status`);
    if (
      !Array.isArray(node.paths) ||
      !node.paths.length ||
      !Array.isArray(node.adrs) ||
      !Array.isArray(node.dependsOn)
    )
      throw new Error(`${node.id}: invalid references`);
    if (typeof node.sourceFingerprint !== 'string')
      throw new Error(`${node.id}: missing fingerprint`);
    for (const path of [...node.paths, ...node.adrs]) {
      if (
        typeof path !== 'string' ||
        isAbsolute(path) ||
        path.includes('\\') ||
        path.split('/').includes('..') ||
        /(^|\/)(\.env|\.dev.vars|node_modules|work)(\/|\.|$)/.test(path)
      )
        throw new Error(`${node.id}: unsafe source path`);
    }
  }
  for (const node of graph.nodes) {
    for (const dependency of node.dependsOn) {
      if (!ids.has(dependency) || dependency === node.id)
        throw new Error(`${node.id}: invalid dependency ${dependency}`);
    }
  }
  const visit = (id, stack = []) => {
    if (stack.includes(id))
      throw new Error(`Context dependency cycle: ${[...stack, id].join(' -> ')}`);
    for (const dependency of graph.nodes.find((node) => node.id === id).dependsOn)
      visit(dependency, [...stack, id]);
  };
  for (const id of ids) visit(id);
  if (!Array.isArray(graph.handoffs) || graph.handoffs.length > 10)
    throw new Error('Keep at most ten handoffs');
  for (const handoff of graph.handoffs) {
    if (
      typeof handoff.summary !== 'string' ||
      !handoff.summary.trim() ||
      typeof handoff.next !== 'string' ||
      !Array.isArray(handoff.modules) ||
      handoff.modules.some((id) => !ids.has(id))
    )
      throw new Error('Invalid handoff');
  }
}

export async function fingerprint(root, node) {
  const hash = createHash('sha256');
  for (const path of [...new Set([...node.paths, ...node.adrs])].sort()) {
    const target = resolve(root, path);
    if (relative(root, target).startsWith('..')) throw new Error('Source escapes repository');
    const text = await readFile(target, 'utf8');
    hash.update(path).update('\0').update(text.replace(/\r\n/g, '\n')).update('\0');
  }
  return hash.digest('hex');
}

export async function checkGraph(root, graph) {
  validateGraph(graph);
  for (const node of graph.nodes) {
    if (node.sourceFingerprint !== (await fingerprint(root, node)))
      throw new Error(`${node.id}: stale context; review its summary, then pnpm context:refresh`);
  }
}

async function main() {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const path = resolve(root, 'docs/CONTEXT.md');
  const markdown = await readFile(path, 'utf8');
  const graph = readGraph(markdown);
  validateGraph(graph);
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const [command = 'check', id] = args;
  if (command === 'refresh') {
    for (const node of graph.nodes) node.sourceFingerprint = await fingerprint(root, node);
    await writeFile(
      path,
      markdown.replace(
        /```json\s*\n[\s\S]*?\n```/,
        `\`\`\`json\n${JSON.stringify(graph, null, 2)}\n\`\`\``,
      ),
    );
    console.log(
      `Refreshed ${graph.nodes.length} source fingerprints. Review summaries separately.`,
    );
  } else if (command === 'show') {
    if (id && !graph.nodes.some((node) => node.id === id)) throw new Error(`Unknown module: ${id}`);
    const selected = id
      ? graph.nodes.filter((node) => node.id === id)
      : graph.nodes.map(({ id, status, summary }) => ({ id, status, summary }));
    console.log(JSON.stringify(selected, null, 2));
  } else if (command === 'check') {
    await checkGraph(root, graph);
    console.log(
      `Context valid and fresh: ${graph.nodes.length} modules, ${graph.handoffs.length} handoffs.`,
    );
  } else throw new Error('Use check, refresh or show [module-id]');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
