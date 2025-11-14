-- ============================================
-- JOYFUL CHURCH ATTENDANCE TRACKING SYSTEM
-- Database Schema (PostgreSQL / Supabase)
-- ============================================
--
-- This is the authoritative database schema for the project.
-- All table names use PascalCase (e.g., "Session", "Member")
-- All column names use snake_case (e.g., public_token, phone_last4)
--
-- Usage: Run this script in Supabase SQL Editor to initialize the database
-- ============================================

-- 1단계: 기존 정책 삭제
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

-- 3단계: 테이블 생성

-- AdminUser: 관리자 계정
CREATE TABLE "AdminUser" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt hashed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member: 교회 멤버 (찬양팀 등)
CREATE TABLE "Member" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,  -- Format: 010-1234-5678 or 01012345678
  "group" TEXT NOT NULL,  -- 그룹 (보컬, 악기, 음향 등)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_phone ON "Member"(phone);
CREATE INDEX idx_member_is_active ON "Member"(is_active);

-- Session: 예배 세션
CREATE TABLE "Session" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,  -- e.g., "주일 1부 예배"
  note TEXT,  -- Optional notes
  date TIMESTAMPTZ DEFAULT NOW(),
  public_token TEXT UNIQUE NOT NULL,  -- Public URL token for check-in
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_public_token ON "Session"(public_token);
CREATE INDEX idx_session_date ON "Session"(date);

-- SessionMember: 세션에 초대된 멤버 (Many-to-Many)
CREATE TABLE "SessionMember" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES "Member"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_session_member UNIQUE(session_id, member_id)
);

CREATE INDEX idx_session_member_session ON "SessionMember"(session_id);
CREATE INDEX idx_session_member_member ON "SessionMember"(member_id);

-- Attendance: 출석 체크 기록
-- phone_last4 기반으로 체크인 (멤버 테이블에 없는 사람도 체크인 가능)
CREATE TABLE "Attendance" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  phone_last4 TEXT NOT NULL CHECK (length(phone_last4) = 4),  -- 핸드폰 뒷자리 4자리
  member_id UUID REFERENCES "Member"(id) ON DELETE SET NULL,  -- Nullable: 미등록 사용자 가능
  status TEXT NOT NULL CHECK (status IN ('attend', 'absent', 'late')),  -- 출석 상태
  reason TEXT,  -- 불참 사유 (status='absent'일 때)
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_session_phone UNIQUE(session_id, phone_last4)  -- 한 세션에 같은 번호로 중복 체크인 방지
);

CREATE INDEX idx_attendance_session ON "Attendance"(session_id);
CREATE INDEX idx_attendance_member ON "Attendance"(member_id);
CREATE INDEX idx_attendance_phone_last4 ON "Attendance"(phone_last4);
CREATE INDEX idx_attendance_status ON "Attendance"(status);

-- 4단계: RLS (Row Level Security) 활성화
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SessionMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;

-- 5단계: RLS 정책 생성 (모든 접근 허용 - 개발용)
-- Production 환경에서는 적절한 정책으로 변경 필요
CREATE POLICY "Allow all for anon" ON "AdminUser" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Member" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Session" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "SessionMember" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Attendance" FOR ALL USING (true) WITH CHECK (true);

-- 6단계: 샘플 데이터 삽입

-- 관리자 계정 (password: "admin123")
INSERT INTO "AdminUser" (email, password) VALUES
  ('admin@joyful.app', '$2a$10$HeoPaGRGiHEldTiTdwRv4OGYqUsGAc8kQiFvx3c/lqlOQaYWNT58m');

-- 멤버 샘플 데이터
INSERT INTO "Member" (name, phone, "group") VALUES
  ('김하늘', '010-1234-5678', '보컬'),
  ('이가은', '010-2345-6789', '악기'),
  ('박요한', '010-3456-7890', '음향'),
  ('최민수', '010-4567-8901', '보컬'),
  ('정현우', '010-5678-9012', '악기');

-- 7단계: 확인 쿼리
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

-- Expected Result:
-- AdminUsers: 1
-- Attendance: 0
-- Members: 5
-- SessionMembers: 0
-- Sessions: 0
