import { expect, it, vi } from 'vitest';

const teardown = vi.hoisted(() => ({ database: vi.fn(), session: vi.fn() }));
vi.mock('node:fs/promises', async (original) => ({
  ...(await original()),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: teardown.session,
}));
vi.mock('../scripts/test-db.mjs', () => ({
  startDatabase: async () => ({ runtimeUrl: 'postgres://unused-local-fixture' }),
  databaseSql: vi.fn(),
  stopDatabase: teardown.database,
}));
vi.mock('wrangler', () => ({
  unstable_dev: async () => ({
    port: 8787,
    waitUntilExit: async () => {},
    stop: async () => {
      throw new Error('Injected Worker shutdown failure');
    },
  }),
}));

it('attempts database and session cleanup even when Worker shutdown rejects', async () => {
  const previousExit = process.exitCode;
  const listeners = new Map(
    ['SIGINT', 'SIGTERM'].map((signal) => [signal, process.listeners(signal)]),
  );
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await import('./local.mjs');
    expect(teardown.database).toHaveBeenCalledOnce();
    expect(teardown.session).toHaveBeenCalledOnce();
    expect(process.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith('Local backend: Injected Worker shutdown failure');
  } finally {
    process.exitCode = previousExit;
    for (const [signal, before] of listeners) {
      for (const listener of process.listeners(signal)) {
        if (!before.includes(listener)) process.removeListener(signal, listener);
      }
    }
    log.mockRestore();
    error.mockRestore();
  }
});
