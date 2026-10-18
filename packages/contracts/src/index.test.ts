import { describe, expect, it } from 'vitest';
import { CreateDishRevisionSchema, DishIntentEventSchema, HealthResponseSchema } from './index';

const event = {
  eventId: '0199b409-a700-7000-8000-000000000001',
  schemaVersion: 1,
  sessionId: '0199b409-a700-7000-8000-000000000002',
  sequence: 1,
  eventType: 'dish_open',
  occurredAt: '2026-10-13T12:00:00.000Z',
  publicationHash: 'a'.repeat(64),
  dishRevisionHash: 'b'.repeat(64),
  displayedTier: 'T0',
  rendererVersion: null,
  manifestHash: null,
  availabilityVersion: 0,
  experimentAssignment: null,
};

describe('dish observation boundary', () => {
  it('accepts a pinned photo exposure without a renderer', () => {
    expect(DishIntentEventSchema.parse(event)).toEqual(event);
  });
  it('rejects enhanced evidence on a photo-only exposure', () => {
    expect(
      DishIntentEventSchema.safeParse({ ...event, manifestHash: 'c'.repeat(64) }).success,
    ).toBe(false);
    expect(DishIntentEventSchema.safeParse({ ...event, rendererVersion: '0.183.0' }).success).toBe(
      false,
    );
  });
  it('rejects browser-supplied authority and server timestamps', () => {
    expect(DishIntentEventSchema.safeParse({ ...event, tenantId: 'spoofed' }).success).toBe(false);
    expect(
      DishIntentEventSchema.safeParse({ ...event, receivedAt: event.occurredAt }).success,
    ).toBe(false);
  });
  it('requires actual renderer and manifest versions for enhanced tiers', () => {
    expect(DishIntentEventSchema.safeParse({ ...event, displayedTier: 'T1' }).success).toBe(false);
    expect(
      DishIntentEventSchema.safeParse({
        ...event,
        displayedTier: 'T1',
        rendererVersion: '0.183.2',
        manifestHash: 'c'.repeat(64),
      }).success,
    ).toBe(true);
  });
  it('rejects malformed identity, sequence and exposure references', () => {
    for (const patch of [
      { eventId: 'invalid' },
      { sequence: 0 },
      { publicationHash: '' },
      { occurredAt: 'yesterday' },
    ]) {
      expect(DishIntentEventSchema.safeParse({ ...event, ...patch }).success).toBe(false);
    }
  });
});

it('health describes the scaffold without claiming database readiness', () => {
  expect(
    HealthResponseSchema.parse({ status: 'ok', service: 'peekaplate-api', stage: 'foundation' })
      .stage,
  ).toBe('foundation');
});

describe('dish command boundary', () => {
  const command = {
    commandId: '00000000-0000-4000-8000-000000000001',
    expectedVersion: 0,
    name: ' Soup ',
    description: ' Seasonal vegetables ',
  };
  it('normalizes content for stable retries', () => {
    expect(CreateDishRevisionSchema.parse(command)).toEqual({
      ...command,
      name: 'Soup',
      description: 'Seasonal vegetables',
    });
  });
  it('rejects claimed authority, invalid versions and oversized content', () => {
    for (const patch of [
      { actorId: command.commandId },
      { tenantId: command.commandId },
      { role: 'owner' },
      { expectedVersion: -1 },
      { expectedVersion: 0.5 },
      { expectedVersion: 2_147_483_647 },
      { name: ' ' },
      { name: 'x'.repeat(161) },
      { name: 'Soup\u0000' },
      { description: 'Text\u0000' },
      { description: 'x'.repeat(4001) },
      { commandId: 'not-a-uuid' },
    ])
      expect(CreateDishRevisionSchema.safeParse({ ...command, ...patch }).success).toBe(false);
  });
});
