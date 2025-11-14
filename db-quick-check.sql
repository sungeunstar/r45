-- ============================================
-- 빠른 DB 상태 확인
-- ============================================

-- 현재 존재하는 모든 테이블 확인
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 각 테이블의 레코드 수 확인
SELECT 'AdminUser' as table_name, COUNT(*) as count FROM "AdminUser"
UNION ALL
SELECT 'Member', COUNT(*) FROM "Member"
UNION ALL
SELECT 'Session', COUNT(*) FROM "Session"
UNION ALL
SELECT 'SessionMember', COUNT(*) FROM "SessionMember"
UNION ALL
SELECT 'Attendance', COUNT(*) FROM "Attendance";

-- 세션 목록 확인 (있다면)
SELECT id, name, date, public_token, created_at
FROM "Session"
ORDER BY created_at DESC;
