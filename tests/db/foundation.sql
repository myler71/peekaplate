BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(15);

INSERT INTO app_private.venues (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Venue one'),
  ('00000000-0000-0000-0000-000000000002', 'Venue two');
INSERT INTO app_private.es_event (id, tenant_id, stream_type, stream_id, version, schema_version, event_type, payload) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'dish', '20000000-0000-0000-0000-000000000001', 1, 1, 'dish.created', '{"dishId":"20000000-0000-0000-0000-000000000001"}');
INSERT INTO app_private.es_command (id, tenant_id, actor_id, command_type, idempotency_key, payload, request_hash, result) VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'dish.create', 'request-1', '{}', repeat('a', 64), '{}');

SELECT has_table('app_private', 'es_event', 'event store exists');
SELECT throws_like(
  $$INSERT INTO app_private.es_event (id, tenant_id, stream_type, stream_id, version, schema_version, event_type, payload) VALUES ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'dish', '20000000-0000-0000-0000-000000000001', 1, 1, 'dish.created', '{}')$$,
  'duplicate key value violates unique constraint%', 'stream versions are unique');
SELECT throws_like(
  $$INSERT INTO app_private.es_event (id, tenant_id, stream_type, stream_id, version, schema_version, event_type, payload) VALUES ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'dish', '20000000-0000-0000-0000-000000000002', 1, 0, 'dish.created', '{}')$$,
  'new row for relation "es_event" violates check constraint%', 'schema version must be positive');
SELECT throws_ok($$UPDATE app_private.es_event SET event_type = 'changed'$$, 'append-only table es_event rejects UPDATE', 'events reject updates');
SELECT throws_ok($$DELETE FROM app_private.es_event$$, 'append-only table es_event rejects DELETE', 'events reject deletes');
SELECT throws_ok($$TRUNCATE app_private.es_event CASCADE$$, 'append-only table es_event rejects TRUNCATE', 'events reject truncation');

CREATE ROLE peekaplate_test_reader NOLOGIN;
GRANT USAGE ON SCHEMA app_private TO peekaplate_test_reader;
GRANT SELECT, INSERT ON app_private.venues, app_private.es_event TO peekaplate_test_reader;
SET ROLE peekaplate_test_reader;
SELECT is((SELECT count(*) FROM app_private.es_event), 0::bigint, 'tenant without context reads no events');
SELECT set_config('app.tenant_id', '00000000-0000-0000-0000-000000000001', false);
SELECT is((SELECT count(*) FROM app_private.es_event), 1::bigint, 'tenant reads its event');
SELECT set_config('app.tenant_id', '00000000-0000-0000-0000-000000000002', false);
SELECT is((SELECT count(*) FROM app_private.es_event), 0::bigint, 'tenant cannot read another tenant event');
SELECT set_config('app.tenant_id', '00000000-0000-0000-0000-000000000001', false);
SELECT throws_like(
  $$INSERT INTO app_private.es_event (id, tenant_id, stream_type, stream_id, version, schema_version, event_type, payload) VALUES ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'dish', '20000000-0000-0000-0000-000000000003', 1, 1, 'dish.created', '{}')$$,
  'new row violates row-level security policy for table "es_event"%', 'tenant cannot write another tenant event');
RESET ROLE;
SELECT is((SELECT relforcerowsecurity FROM pg_class WHERE oid = 'app_private.es_event'::regclass), true, 'event RLS is forced');
SELECT is((SELECT has_table_privilege('public', 'app_private.es_event', 'select')), false, 'public has no event read grant');
SELECT throws_like(
  $$INSERT INTO app_private.es_command (id, tenant_id, actor_id, command_type, idempotency_key, payload, request_hash, result) VALUES ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'dish.create', 'request-1', '{}', repeat('a', 64), '{}')$$,
  'duplicate key value violates unique constraint%', 'same actor command key is idempotent');
SELECT lives_ok(
  $$INSERT INTO app_private.es_command (id, tenant_id, actor_id, command_type, idempotency_key, payload, request_hash, result) VALUES ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'dish.create', 'request-1', '{}', repeat('a', 64), '{}')$$,
  'other actor may reuse command key');
SELECT throws_like(
  $$INSERT INTO app_private.es_command (id, tenant_id, actor_id, command_type, idempotency_key, payload, request_hash, result) VALUES ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'dish.create', 'request-2', '{}', 'invalid', '{}')$$,
  'new row for relation "es_command" violates check constraint%', 'command request hash is SHA-256 hex');

SELECT * FROM finish();
ROLLBACK;
