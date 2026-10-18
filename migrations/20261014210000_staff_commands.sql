-- migrate:up
CREATE TABLE app_private.staff_membership (
  tenant_id uuid NOT NULL REFERENCES app_private.venues(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL,
  permission text NOT NULL CHECK (permission IN ('owner', 'editor', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, actor_id)
);

CREATE TABLE app_private.dish_current (
  tenant_id uuid NOT NULL REFERENCES app_private.venues(id) ON DELETE RESTRICT,
  dish_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  revision_id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  description text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, dish_id),
  UNIQUE (tenant_id, revision_id)
);

ALTER TABLE app_private.staff_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_private.staff_membership FORCE ROW LEVEL SECURITY;
CREATE POLICY membership_actor_read ON app_private.staff_membership
  FOR SELECT USING (actor_id = NULLIF(current_setting('app.actor_id', true), '')::uuid);
CREATE POLICY membership_actor_lock ON app_private.staff_membership
  FOR UPDATE
  USING (actor_id = NULLIF(current_setting('app.actor_id', true), '')::uuid)
  WITH CHECK (false);

ALTER TABLE app_private.dish_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_private.dish_current FORCE ROW LEVEL SECURITY;
CREATE POLICY dish_current_tenant_scope ON app_private.dish_current
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

DO $$
DECLARE
  runtime_role record;
BEGIN
  SELECT oid, rolsuper, rolcreatedb, rolcreaterole, rolcanlogin, rolreplication, rolbypassrls, rolinherit
    INTO runtime_role
    FROM pg_roles
    WHERE rolname = 'peekaplate_runtime';
  IF NOT FOUND THEN
    CREATE ROLE peekaplate_runtime NOLOGIN NOINHERIT;
  ELSIF runtime_role.rolsuper OR runtime_role.rolcreatedb OR runtime_role.rolcreaterole
    OR runtime_role.rolcanlogin OR runtime_role.rolreplication OR runtime_role.rolbypassrls
    OR runtime_role.rolinherit
    OR EXISTS (SELECT 1 FROM pg_auth_members WHERE member = runtime_role.oid) THEN
    RAISE EXCEPTION 'peekaplate_runtime exists with unsafe attributes or role membership';
  END IF;
END;
$$;

GRANT USAGE ON SCHEMA app_private TO peekaplate_runtime;
GRANT SELECT, UPDATE (permission) ON app_private.staff_membership TO peekaplate_runtime;
GRANT SELECT, INSERT, UPDATE ON app_private.dish_current TO peekaplate_runtime;
GRANT SELECT, INSERT ON app_private.es_event, app_private.es_command, app_private.outbox TO peekaplate_runtime;

-- migrate:down
DO $$
BEGIN
  RAISE EXCEPTION 'Staff command rollback is intentionally unsupported; use a forward corrective migration.';
END;
$$;
