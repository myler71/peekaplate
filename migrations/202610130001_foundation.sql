-- migrate:up
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;

CREATE TABLE app_private.venues (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_private.es_event (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES app_private.venues(id) ON DELETE RESTRICT,
  stream_type text NOT NULL CHECK (length(btrim(stream_type)) > 0),
  stream_id uuid NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  schema_version integer NOT NULL CHECK (schema_version > 0),
  event_type text NOT NULL CHECK (length(btrim(event_type)) > 0),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, stream_type, stream_id, version),
  UNIQUE (tenant_id, id)
);

CREATE TABLE app_private.es_command (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES app_private.venues(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL,
  command_type text NOT NULL CHECK (length(btrim(command_type)) > 0),
  idempotency_key text NOT NULL CHECK (length(btrim(idempotency_key)) > 0),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  request_hash text NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  result jsonb NOT NULL CHECK (jsonb_typeof(result) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, actor_id, idempotency_key)
);

CREATE TABLE app_private.outbox (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES app_private.venues(id) ON DELETE RESTRICT,
  event_id uuid NOT NULL,
  topic text NOT NULL CHECK (length(btrim(topic)) > 0),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  dispatched_at timestamptz,
  UNIQUE (event_id, topic),
  FOREIGN KEY (tenant_id, event_id) REFERENCES app_private.es_event(tenant_id, id) ON DELETE RESTRICT
);

CREATE FUNCTION app_private.reject_append_only_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'append-only table % rejects %', TG_TABLE_NAME, TG_OP;
END;
$$;
REVOKE ALL ON FUNCTION app_private.reject_append_only_change() FROM PUBLIC;

CREATE TRIGGER es_event_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON app_private.es_event
  FOR EACH STATEMENT EXECUTE FUNCTION app_private.reject_append_only_change();

ALTER TABLE app_private.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_private.venues FORCE ROW LEVEL SECURITY;
CREATE POLICY venue_tenant_scope ON app_private.venues
  USING (id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE app_private.es_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_private.es_event FORCE ROW LEVEL SECURITY;
CREATE POLICY event_tenant_scope ON app_private.es_event
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE app_private.es_command ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_private.es_command FORCE ROW LEVEL SECURITY;
CREATE POLICY command_tenant_scope ON app_private.es_command
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE app_private.outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_private.outbox FORCE ROW LEVEL SECURITY;
CREATE POLICY outbox_tenant_scope ON app_private.outbox
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

REVOKE ALL ON ALL TABLES IN SCHEMA app_private FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_private REVOKE ALL ON TABLES FROM PUBLIC;

-- migrate:down
DO $$
BEGIN
  RAISE EXCEPTION 'Foundation event-store rollback is intentionally unsupported; use a forward corrective migration.';
END;
$$;
