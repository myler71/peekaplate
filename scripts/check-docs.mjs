import { access, readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = `${directory}/${entry.name}`;
      return entry.isDirectory() ? markdownFiles(path) : entry.name.endsWith('.md') ? [path] : [];
    }),
  );
  return nested.flat();
}

export async function checkLocalLinks(root, files) {
  const failures = [];
  for (const file of files) {
    const source = (await readFile(resolve(root, file), 'utf8')).replace(/```[\s\S]*?```/g, '');
    for (const match of source.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const link = match[1];
      if (/^(?:https?:|mailto:|#)/.test(link)) continue;
      const target = decodeURIComponent(link.split('#')[0]);
      try {
        await access(resolve(root, dirname(file), target));
      } catch {
        failures.push(`${file}: missing ${target}`);
      }
    }
  }
  if (failures.length) throw new Error(failures.join('\n'));
}

async function main() {
  const files = [
    'README.md',
    'CONTRIBUTING.md',
    'AGENTS.md',
    'CLAUDE.md',
    'SECURITY.md',
    ...(await markdownFiles('docs')),
    ...(await markdownFiles('.agents')),
    ...(await markdownFiles('.claude')),
  ];
  await checkLocalLinks(process.cwd(), files);
  console.log(
    `Local documentation links checked in ${files.length} Markdown files; external URLs and anchors are not checked.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
