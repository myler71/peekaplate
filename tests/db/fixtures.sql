-- =====================================================================
-- PEEKAPLATE - S3-DATA-02 INTEGRATION FIXTURES
-- PATH: tests/db/fixtures.sql
-- DRI: Louis Dieme
-- =====================================================================

TRUNCATE TABLE events RESTART IDENTITY CASCADE;


INSERT INTO events (venue_id, event_id, restaurant_id, session_id, event_type, created_at) VALUES
    -- -----------------------------------------------------------------
    -- RESTO_9: Exactement 9 sessions uniques (Doit etre STRICTEMENT masque)
    -- -----------------------------------------------------------------
    ('v_dakar', 'evt_101', 'resto_9', 'sess_01', 'view_dish', NOW()),
    ('v_dakar', 'evt_101', 'resto_9', 'sess_01', 'view_dish', NOW()), -- DOUBLE RETRY RESEAU (Meme event_id)
    ('v_dakar', 'evt_102', 'resto_9', 'sess_02', 'view_dish', NOW()),
    ('v_dakar', 'evt_103', 'resto_9', 'sess_03', 'view_dish', NOW()),
    ('v_dakar', 'evt_104', 'resto_9', 'sess_04', 'view_dish', NOW()),
    ('v_dakar', 'evt_105', 'resto_9', 'sess_05', 'view_dish', NOW()),
    ('v_dakar', 'evt_106', 'resto_9', 'sess_06', 'view_dish', NOW()),
    ('v_dakar', 'evt_107', 'resto_9', 'sess_07', 'view_dish', NOW()),
    ('v_dakar', 'evt_108', 'resto_9', 'sess_08', 'view_dish', NOW()),
    ('v_dakar', 'evt_109', 'resto_9', 'sess_09', 'view_dish', NOW()),

    -- -----------------------------------------------------------------
    -- RESTO_10: Exactement 10 sessions uniques (Doit s'afficher normalement)
    -- -----------------------------------------------------------------
    ('v_dakar', 'evt_201', 'resto_10', 'sess_A', 'view_dish', NOW()),
    ('v_dakar', 'evt_202', 'resto_10', 'sess_B', 'view_dish', NOW()),
    ('v_dakar', 'evt_203', 'resto_10', 'sess_C', 'view_dish', NOW()),
    ('v_dakar', 'evt_204', 'resto_10', 'sess_D', 'view_dish', NOW()),
    ('v_dakar', 'evt_205', 'resto_10', 'sess_E', 'view_dish', NOW()),
    ('v_dakar', 'evt_206', 'resto_10', 'sess_F', 'view_dish', NOW()),
    ('v_dakar', 'evt_207', 'resto_10', 'sess_G', 'view_dish', NOW()),
    ('v_dakar', 'evt_208', 'resto_10', 'sess_H', 'view_dish', NOW()),
    ('v_dakar', 'evt_209', 'resto_10', 'sess_I', 'view_dish', NOW()),
    ('v_dakar', 'evt_210', 'resto_10', 'sess_J', 'view_dish', NOW());
