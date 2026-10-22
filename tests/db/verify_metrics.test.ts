// =====================================================================
// PEEKAPLATE - AUTOMATED POSTGRESQL INTEGRATION TEST
// PATH: tests/db/verify_metrics.test.ts
// DRI: Louis Dieme | Code Review Partner: Jeffin
// =====================================================================
import { assert } from "chai";
import { db } from "../../src/backend/db_client"; 

describe("S3-DATA-02: Live Supabase SQL Metric Verification Tests", () => {
  
  const productionQuery = `
    SELECT 
        venue_id,
        restaurant_id,
        CASE WHEN COUNT(DISTINCT session_id) < 10 THEN NULL ELSE COUNT(event_id) END AS total_clicks,
        CASE WHEN COUNT(DISTINCT session_id) < 10 THEN NULL ELSE COUNT(DISTINCT session_id) END AS raw_unique_sessions,
        CASE WHEN COUNT(DISTINCT session_id) < 10 THEN 'insufficient data' ELSE CAST(COUNT(DISTINCT session_id) AS TEXT) END AS reconciled_sessions,
        CASE WHEN COUNT(DISTINCT session_id) < 10 THEN 'SUPPRESSED' ELSE 'NORMAL' END AS status
    FROM (
        SELECT DISTINCT ON (venue_id, event_id) * FROM events
    ) AS deduplicated_events
    GROUP BY venue_id, restaurant_id;
  `;

  it("should strictly hide all numbers and return SUPPRESSED for the 9-session frontier (resto_9)", async () => {
    const result = await db.query(productionQuery);
    const resto9 = result.rows.find((r: any) => r.restaurant_id === "resto_9");

    assert.isNotNull(resto9, "QA Failure: resto_9 records must exist in result schema.");
    assert.isNull(resto9.total_clicks, "Privacy Violation: total_clicks must be hidden (NULL) if sessions < 10.");
    assert.isNull(resto9.raw_unique_sessions, "Privacy Violation: raw_unique_sessions must be hidden (NULL).");
    assert.equal(resto9.reconciled_sessions, "insufficient data", "UX Contract Failure: Display text mismatch.");
    assert.equal(resto9.status, "SUPPRESSED", "State Failure: Verification gate should be SUPPRESSED.");
  });

  it("should fully expose all aggregated metrics for the 10-session frontier (resto_10)", async () => {
    const result = await db.query(productionQuery);
    const resto10 = result.rows.find((r: any) => r.restaurant_id === "resto_10");

    assert.isNotNull(resto10, "QA Failure: resto_10 records must exist.");
    assert.equal(resto10.total_clicks, 10, "Deduplication Failure: Clicks mismatch (Network retry was not filtered).");
    assert.equal(resto10.raw_unique_sessions, 10, "Calculation Failure: Unique session count mismatch.");
    assert.equal(resto10.status, "NORMAL", "State Failure: Verification gate should clear data as NORMAL.");
  });
});
