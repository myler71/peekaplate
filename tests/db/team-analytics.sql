BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(11);
INSERT INTO analytics_private.posthog_events(uuid,event,properties,team_id,timestamp,distinct_id,ip) VALUES
 ('safe','app_shell_viewed','{"environment":"staging","surface":"diner","schema_version":1,"private_text":"never return"}',675372,'2026-10-20T06:00:00Z','hidden visitor','127.0.0.1'),
 ('safe','app_shell_viewed','{"environment":"staging","surface":"diner","schema_version":1,"private_text":"never return"}',675372,'2026-10-20T06:00:00Z','hidden visitor','127.0.0.1'),
 ('production','app_shell_viewed','{"environment":"production","surface":"diner"}',675372,'2026-10-20T06:00:00Z',NULL,NULL),
 ('other-project','app_shell_viewed','{"environment":"staging","surface":"diner"}',2,'2026-10-20T06:00:00Z',NULL,NULL);
SET LOCAL ROLE peekaplate_runtime;
SELECT throws_like($$SELECT team_api_private.read_analytics(2,'events','2026-10-20T06:00:00Z','2026-10-20T07:00:00Z',50)$$,'forbidden','other project denied');
SELECT is(jsonb_array_length(team_api_private.read_analytics(675372,'events','2026-10-20T06:00:00Z','2026-10-20T07:00:00Z',50)->'events'),1,'duplicates, production and other projects excluded');
SELECT is(team_api_private.read_analytics(675372,'events','2026-10-20T06:00:00Z','2026-10-20T07:00:00Z',50)->'events'->0->'properties','{"schema_version":1}'::jsonb,'only allowlisted properties returned');
SELECT ok(NOT (team_api_private.read_analytics(675372,'events','2026-10-20T06:00:00Z','2026-10-20T07:00:00Z',50)->'events'->0 ?| ARRAY['ip','distinct_id','person_properties']),'visitor identifiers are absent');
SELECT is(team_api_private.read_analytics(675372,'summary','2026-10-20T06:00:00Z','2026-10-20T07:00:00Z',50)->'counts'->0->>'count','1','summary uses the same deduplicated scope');
SELECT throws_like($$SELECT * FROM team_api_private.project_scope$$,'permission denied for table project_scope','runtime cannot enumerate or enable project scopes');
SELECT throws_like($$SELECT * FROM analytics_private.posthog_events$$,'permission denied for schema analytics_private','runtime still cannot read raw analytics');
SELECT throws_like($$SELECT team_api_private.read_analytics(675372,'events','2026-10-01T00:00:00Z','2026-10-20T07:00:00Z',50)$$,'invalid_request','SQL also rejects broad ranges');
RESET ROLE;
DELETE FROM team_api_private.project_scope;
SET LOCAL ROLE peekaplate_runtime;
SELECT throws_like($$SELECT team_api_private.read_analytics(675372,'summary','2026-10-20T06:00:00Z','2026-10-20T07:00:00Z',50)$$,'forbidden','disabling the project denies the next request');
RESET ROLE;
CREATE ROLE team_test_untrusted NOLOGIN;
SELECT ok(NOT has_function_privilege('team_test_untrusted','team_api_private.read_analytics(integer,text,timestamptz,timestamptz,integer)','EXECUTE'),'untrusted roles cannot invoke the function');
SELECT ok(NOT has_schema_privilege('peekaplate_posthog_export','team_api_private','USAGE'),'exporter has no team-access administration');
SELECT * FROM finish();
ROLLBACK;
