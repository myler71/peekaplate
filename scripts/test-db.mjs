import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const suffix = `${process.pid}-${Date.now()}`;
const network = `peekaplate-db-${suffix}`;
const container = `peekaplate-db-${suffix}`;
const postgresImage = 'peekaplate-postgres-pgtap:16.11';
const dbmateImage = 'ghcr.io/amacneil/dbmate:2.36.0';
const databaseUrl = 'postgres://postgres:peekaplate_test@db:5432/peekaplate?sslmode=disable';

export function ensureSuccess(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error(`${label}: exited ${result.status ?? 'without a status'}`);
}

export function validateTap(output) {
  if (/^\s*bail out!/im.test(output)) throw new Error('pgTAP bailed out');
  const failure = output.match(/^\s*not ok.*$/im);
  if (failure) {
    const lines = output.split(/\r?\n/);
    const index = lines.findIndex((line) => line.trim() === failure[0].trim());
    throw new Error(
      `pgTAP assertion failed: ${lines
        .slice(index, index + 5)
        .join(' ')
        .trim()}`,
    );
  }

  const plans = [...output.matchAll(/^\s*1\.\.(\d+)\s*$/gm)];
  if (plans.length !== 1) throw new Error('pgTAP must emit exactly one plan');

  const planned = Number(plans[0][1]);
  const assertions = [...output.matchAll(/^\s*ok\s+(\d+)(?:\s|$)/gim)].map((match) =>
    Number(match[1]),
  );
  if (planned === 0 || assertions.length !== planned)
    throw new Error(`pgTAP plan mismatch: expected ${planned}, got ${assertions.length}`);
  if (
    new Set(assertions).size !== planned ||
    assertions.some((number) => number < 1 || number > planned)
  ) {
    throw new Error('pgTAP assertion numbering is invalid');
  }
  return planned;
}

function docker(args, label, options = {}) {
  const result = spawnSync('docker', args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 120_000,
    ...options,
  });
  ensureSuccess(result, label);
  return result;
}

async function waitForPostgres() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = spawnSync(
      'docker',
      ['exec', container, 'pg_isready', '-U', 'postgres', '-d', 'peekaplate'],
      { cwd: root, encoding: 'utf8', timeout: 5_000 },
    );
    if (result.status === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error('Postgres did not become ready within 30 seconds');
}

export async function main() {
  let networkCreated = false;
  try {
    docker(
      ['build', '--tag', postgresImage, '--file', 'tests/db/Dockerfile', 'tests/db'],
      'build database test image',
    );
    docker(['network', 'create', network], 'create database test network');
    networkCreated = true;
    docker(
      [
        'run',
        '--detach',
        '--name',
        container,
        '--network',
        network,
        '--network-alias',
        'db',
        '--mount',
        `type=bind,source=${root}tests/db,target=/tests,readonly`,
        '--env',
        'POSTGRES_PASSWORD=peekaplate_test',
        '--env',
        'POSTGRES_DB=peekaplate',
        postgresImage,
      ],
      'start Postgres',
    );
    await waitForPostgres();
    const dbmateArgs = [
      'run',
      '--rm',
      '--network',
      network,
      '--env',
      `DATABASE_URL=${databaseUrl}`,
      '--mount',
      `type=bind,source=${root}migrations,target=/migrations,readonly`,
      dbmateImage,
      '--migrations-dir',
      '/migrations',
      'up',
    ];
    docker(dbmateArgs, 'apply migrations');
    docker(dbmateArgs, 'confirm migrations are already applied');
    const tap = docker(
      [
        'exec',
        container,
        'psql',
        '--tuples-only',
        '--no-align',
        '--username',
        'postgres',
        '--dbname',
        'peekaplate',
        '--set',
        'ON_ERROR_STOP=1',
        '--file',
        '/tests/foundation.sql',
      ],
      'run pgTAP',
    );
    const count = validateTap(tap.stdout);
    process.stdout.write(`pgTAP: ${count} assertions passed\n`);
  } finally {
    spawnSync('docker', ['rm', '--force', container], {
      cwd: root,
      encoding: 'utf8',
      timeout: 30_000,
    });
    if (networkCreated)
      spawnSync('docker', ['network', 'rm', network], {
        cwd: root,
        encoding: 'utf8',
        timeout: 30_000,
      });
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`test:db failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
