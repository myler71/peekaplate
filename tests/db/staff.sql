BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(17);

INSERT INTO app_private.venues (id, name) VALUES
  ('00000000-0000-0000-0000-000000000101', 'Staff venue'),
  ('00000000-0000-0000-0000-000000000102', 'Other venue');
INSERT INTO app_private.staff_membership (tenant_id, actor_id, permission) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', 'editor'),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000202', 'viewer'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000201', 'owner');

SELECT has_table('app_private', 'staff_membership', 'staff membership exists');
SELECT has_table('app_private', 'dish_current', 'dish projection exists');
SELECT is((SELECT relforcerowsecurity FROM pg_class WHERE oid = 'app_private.staff_membership'::regclass), true, 'membership RLS is forced');
SELECT is((SELECT relforcerowsecurity FROM pg_class WHERE oid = 'app_private.dish_current'::regclass), true, 'dish projection RLS is forced');
SELECT ok(NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolbypassrls AND NOT rolcanlogin AND NOT rolreplication AND NOT rolinherit, 'runtime role has only safe role attributes')
  FROM pg_roles WHERE rolname = 'peekaplate_runtime';
SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM pg_auth_members memberships
    JOIN pg_roles runtime ON runtime.oid = memberships.member
    WHERE runtime.rolname = 'peekaplate_runtime'
  ),
  'runtime role has no parent role memberships'
);
SELECT is((SELECT has_table_privilege('peekaplate_runtime', 'app_private.staff_membership', 'insert, delete')), false, 'runtime cannot create or delete memberships');
SELECT is((SELECT has_column_privilege('peekaplate_runtime', 'app_private.staff_membership', 'permission', 'update')), true, 'runtime has only the lock-required permission update grant');

SET ROLE peekaplate_runtime;
SELECT is((SELECT count(*) FROM app_private.staff_membership), 0::bigint, 'actor-free runtime sees no membership');
SELECT set_config('app.actor_id', '00000000-0000-0000-0000-000000000201', true);
SELECT is((SELECT count(*) FROM app_private.staff_membership), 2::bigint, 'actor can read only its memberships before tenant context');
SELECT set_config('app.tenant_id', '00000000-0000-0000-0000-000000000101', true);
SELECT lives_ok($$SELECT * FROM app_private.staff_membership WHERE tenant_id = '00000000-0000-0000-0000-000000000101' FOR SHARE$$, 'membership may be share-locked for revocation serialization');
SELECT throws_like(
  $$UPDATE app_private.staff_membership SET permission = 'owner' WHERE tenant_id = '00000000-0000-0000-0000-000000000101' AND actor_id = '00000000-0000-0000-0000-000000000201'$$,
  'new row violates row-level security policy for table "staff_membership"%', 'runtime cannot mutate membership despite lock privilege');
SELECT lives_ok(
  $$INSERT INTO app_private.dish_current (tenant_id, dish_id, version, revision_id, name, description) VALUES ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', 1, '00000000-0000-0000-0000-000000000401', 'Soup', 'Warm')$$,
  'runtime may create own-tenant projection');
SELECT is((SELECT count(*) FROM app_private.dish_current), 1::bigint, 'runtime reads own-tenant projection');
SELECT set_config('app.tenant_id', '00000000-0000-0000-0000-000000000102', true);
SELECT is((SELECT count(*) FROM app_private.dish_current), 0::bigint, 'runtime cannot read another tenant projection');
SELECT throws_like(
  $$INSERT INTO app_private.dish_current (tenant_id, dish_id, version, revision_id, name, description) VALUES ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000302', 1, '00000000-0000-0000-0000-000000000402', 'Soup', 'Warm')$$,
  'new row violates row-level security policy for table "dish_current"%', 'runtime cannot write another tenant projection');
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
