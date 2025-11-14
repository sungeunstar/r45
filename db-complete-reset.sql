-- ============================================
-- 완전 DB 초기화 스크립트 (테이블 삭제 → 재생성)
-- ============================================

-- 1단계: 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Allow all for anon" ON "AdminUser";
DROP POLICY IF EXISTS "Allow all for anon" ON "Member";
DROP POLICY IF EXISTS "Allow all for anon" ON "Session";
DROP POLICY IF EXISTS "Allow all for anon" ON "SessionMember";
DROP POLICY IF EXISTS "Allow all for anon" ON "Attendance";

-- 2단계: 모든 테이블 삭제 (CASCADE로 의존관계도 모두 삭제)
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "SessionMember" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Member" CASCADE;
DROP TABLE IF EXISTS "AdminUser" CASCADE;

-- 혹시 소문자 테이블도 존재한다면 삭제
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS session_members CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- 3단계: 테이블 재생성
CREATE TABLE "AdminUser" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "Member" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  "group" TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_phone ON "Member"(phone);
CREATE INDEX idx_member_is_active ON "Member"(is_active);

CREATE TABLE "Session" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  note TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  public_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_public_token ON "Session"(public_token);
CREATE INDEX idx_session_date ON "Session"(date);

CREATE TABLE "SessionMember" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES "Member"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_session_member UNIQUE(session_id, member_id)
);

CREATE INDEX idx_session_member_session ON "SessionMember"(session_id);
CREATE INDEX idx_session_member_member ON "SessionMember"(member_id);

CREATE TABLE "Attendance" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  phone_last4 TEXT NOT NULL CHECK (length(phone_last4) = 4),
  member_id UUID REFERENCES "Member"(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  reason TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_session_phone UNIQUE(session_id, phone_last4)
);

CREATE INDEX idx_attendance_session ON "Attendance"(session_id);
CREATE INDEX idx_attendance_member ON "Attendance"(member_id);
CREATE INDEX idx_attendance_phone_last4 ON "Attendance"(phone_last4);
CREATE INDEX idx_attendance_status ON "Attendance"(status);

-- 4단계: RLS 활성화
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SessionMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;

-- 5단계: RLS 정책 생성 (모든 접근 허용)
CREATE POLICY "Allow all for anon" ON "AdminUser" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Member" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Session" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "SessionMember" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Attendance" FOR ALL USING (true) WITH CHECK (true);

-- 6단계: 샘플 데이터 삽입
INSERT INTO "AdminUser" (email, password) VALUES
  ('admin@joyful.app', '$2a$10$HeoPaGRGiHEldTiTdwRv4OGYqUsGAc8kQiFvx3c/lqlOQaYWNT58m');

INSERT INTO "Member" (name, phone, "group") VALUES
  ('김하늘', '010-1234-5678', '보컬'),
  ('이가은', '010-2345-6789', '악기'),
  ('박요한', '010-3456-7890', '음향'),
  ('최민수', '010-4567-8901', '보컬'),
  ('정현우', '010-5678-9012', '악기');

-- 7단계: 확인
SELECT 'AdminUsers' as table_name, COUNT(*) as count FROM "AdminUser"
UNION ALL
SELECT 'Members', COUNT(*) FROM "Member"
UNION ALL
SELECT 'Sessions', COUNT(*) FROM "Session"
UNION ALL
SELECT 'SessionMembers', COUNT(*) FROM "SessionMember"
UNION ALL
SELECT 'Attendance', COUNT(*) FROM "Attendance"
ORDER BY table_name;
