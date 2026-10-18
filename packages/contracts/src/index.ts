import { z } from 'zod';

const hash = z.string().regex(/^[a-f0-9]{64}$/);

export const HealthResponseSchema = z.strictObject({
  status: z.literal('ok'),
  service: z.literal('peekaplate-api'),
  stage: z.literal('foundation'),
});

// Initial dish-level contract. Broader event types require their own reviewed payload schemas.
export const DishIntentEventSchema = z
  .strictObject({
    eventId: z.uuid(),
    schemaVersion: z.literal(1),
    sessionId: z.uuid(),
    sequence: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    eventType: z.enum(['dish_open', 'portion_compare']),
    occurredAt: z.iso.datetime(),
    publicationHash: hash,
    dishRevisionHash: hash,
    displayedTier: z.enum(['T0', 'T1', 'T2']),
    rendererVersion: z.string().min(1).max(64).nullable(),
    manifestHash: hash.nullable(),
    availabilityVersion: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    experimentAssignment: z
      .strictObject({
        experimentId: z.uuid(),
        blockId: z.string().min(1).max(64),
        arm: z.string().min(1).max(32),
      })
      .nullable(),
  })
  .superRefine((event, ctx) => {
    if (event.displayedTier !== 'T0' && (!event.rendererVersion || !event.manifestHash)) {
      ctx.addIssue({
        code: 'custom',
        path: ['displayedTier'],
        message: 'Enhanced exposures require renderer and manifest versions',
      });
    }
    if (event.displayedTier === 'T0' && event.rendererVersion !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['rendererVersion'],
        message: 'Photo exposures have no active renderer',
      });
    }
    if (event.displayedTier === 'T0' && event.manifestHash !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['manifestHash'],
        message: 'Photo exposures have no enhanced manifest',
      });
    }
  });

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type DishIntentEvent = z.infer<typeof DishIntentEventSchema>;

const uuid = z.uuid().transform((value) => value.toLowerCase());
const postgresText = z
  .string()
  .refine((value) => !value.includes('\u0000'), 'NUL is not supported');

export const DishRevisionScopeSchema = z.strictObject({ venueId: uuid, dishId: uuid });

export const CreateDishRevisionSchema = z.strictObject({
  commandId: uuid,
  expectedVersion: z.number().int().nonnegative().max(2_147_483_646),
  name: postgresText.trim().min(1).max(160),
  description: postgresText.trim().max(4000),
});

export const DishRevisionSchema = z.strictObject({
  dishId: uuid,
  revisionId: uuid,
  version: z.number().int().positive().max(2_147_483_647),
  name: postgresText.min(1).max(160),
  description: postgresText.max(4000),
});

export type CreateDishRevision = z.infer<typeof CreateDishRevisionSchema>;
export type DishRevision = z.infer<typeof DishRevisionSchema>;
