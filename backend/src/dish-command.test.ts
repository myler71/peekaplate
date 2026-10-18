import { describe, expect, it } from 'vitest';
import { createDishRevision, ReplayError, replayDish } from './dish-command';

type Query = { text: string; values?: unknown[] };

class ScriptedClient {
  readonly queries: Query[] = [];
  private readonly responses: Array<{ rows: unknown[] }>;

  constructor(responses: Array<{ rows: unknown[] }>) {
    this.responses = responses;
  }

  async query(text: string, values?: unknown[]) {
    this.queries.push(values ? { text, values } : { text });
    return this.responses.shift() ?? { rows: [] };
  }
}

const input = {
  commandId: 'command-1',
  dishId: '00000000-0000-4000-8000-000000000010',
  expectedVersion: 0,
  name: 'Spring salad',
  description: 'Citrus and herbs',
};
const actorId = '00000000-0000-0000-0000-000000000001';
const venueId = '00000000-0000-0000-0000-000000000002';

describe('createDishRevision', () => {
  it('authorizes membership before looking up a command receipt', async () => {
    const client = new ScriptedClient([{ rows: [] }]);

    await expect(
      createDishRevision(client as never, actorId, venueId, input),
    ).rejects.toMatchObject({
      code: 'forbidden',
      status: 403,
    });

    expect(client.queries[0]?.text).toContain('BEGIN');
    expect(client.queries.some((query) => query.text.includes('app_private.es_command'))).toBe(
      false,
    );
    expect(client.queries.at(-1)?.text).toContain('ROLLBACK');
  });
});

describe('replayDish', () => {
  it('rebuilds the latest projection without side effects', () => {
    expect(
      replayDish([
        {
          tenantId: venueId,
          streamType: 'dish',
          streamId: input.dishId,
          version: 1,
          schemaVersion: 1,
          eventType: 'dish.revision.created',
          payload: {
            dishId: input.dishId,
            revisionId: '00000000-0000-4000-8000-000000000011',
            version: 1,
            name: input.name,
            description: input.description,
          },
          metadata: { actorId },
        },
      ]),
    ).toEqual({
      tenantId: venueId,
      dishId: input.dishId,
      revisionId: '00000000-0000-4000-8000-000000000011',
      version: 1,
      name: input.name,
      description: input.description,
    });
  });

  it('rejects gaps and unsupported event schemas', () => {
    expect(() =>
      replayDish([
        {
          tenantId: venueId,
          streamType: 'dish',
          streamId: input.dishId,
          version: 2,
          schemaVersion: 1,
          eventType: 'dish.revision.created',
          payload: {},
          metadata: {},
        },
      ]),
    ).toThrow(ReplayError);
    expect(() =>
      replayDish([
        {
          tenantId: venueId,
          streamType: 'dish',
          streamId: input.dishId,
          version: 1,
          schemaVersion: 2,
          eventType: 'dish.revision.created',
          payload: {},
          metadata: {},
        },
      ]),
    ).toThrow(ReplayError);
    expect(() =>
      replayDish([
        {
          tenantId: venueId,
          streamType: 'dish',
          streamId: input.dishId,
          version: 1,
          schemaVersion: 1,
          eventType: 'dish.revision.created',
          payload: {
            dishId: input.dishId,
            revisionId: 'not-a-uuid',
            version: 1,
            name: input.name,
            description: input.description,
          },
          metadata: {},
        },
      ]),
    ).toThrow(ReplayError);
  });
});
