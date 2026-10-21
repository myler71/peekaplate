import {
  type TeamAnalyticsQuery,
  type TeamAnalyticsResponse,
  TeamAnalyticsResponseSchema,
} from '@peekaplate/contracts';
import type { Client } from 'pg';
import { CommandError } from './dish-command';

export async function readTeamAnalytics(
  client: Client,
  actorId: string,
  projectId: number,
  kind: 'events' | 'summary',
  query: TeamAnalyticsQuery,
): Promise<TeamAnalyticsResponse> {
  let started = false;
  try {
    await client.query('BEGIN');
    started = true;
    await client.query("SET LOCAL statement_timeout = '5s'");
    const result = await client.query<{ result: unknown }>(
      'SELECT team_api_private.read_analytics($1::uuid, $2::integer, $3::text, $4::timestamptz, $5::timestamptz, $6::integer) AS result',
      [actorId, projectId, kind, query.from, query.until, query.limit],
    );
    const response = TeamAnalyticsResponseSchema.parse(result.rows[0]?.result);
    await client.query('COMMIT');
    started = false;
    return response;
  } catch (error) {
    if (started) await client.query('ROLLBACK');
    if (error && typeof error === 'object' && 'code' in error && error.code === '42501') {
      throw new CommandError('forbidden', 403);
    }
    throw error;
  }
}
