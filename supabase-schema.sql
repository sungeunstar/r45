-- ============================================
-- Joyful Church Check-in System
-- Supabase Database Schema
-- ============================================
--
-- Supabase Dashboard에서 실행하세요:
-- 1. Supabase Dashboard → SQL Editor
-- 2. 아래 전체 SQL을 복사-붙여넣기
-- 3. Run 클릭
--
-- ============================================

-- 기존 테이블이 있다면 삭제 (깔끔하게 재시작)
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "SessionMember" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Member" CASCADE;
DROP TABLE IF EXISTS "AdminUser" CASCADE;

-- AdminUser 테이블 (관리자 계정)
CREATE TABLE "AdminUser" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member 테이블 (교회 구성원)
CREATE TABLE "Member" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  "group" TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session 테이블 (출석 세션)
CREATE TABLE "Session" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  note TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  public_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SessionMember 테이블 (세션별 참여 구성원)
CREATE TABLE "SessionMember" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES "Member"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, member_id)
);

-- Attendance 테이블 (출석 기록)
CREATE TABLE "Attendance" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES "Member"(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  ip TEXT,
  user_agent TEXT,
  UNIQUE(session_id, member_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_session_member_session ON "SessionMember"(session_id);
CREATE INDEX idx_session_member_member ON "SessionMember"(member_id);
CREATE INDEX idx_attendance_session ON "Attendance"(session_id);
CREATE INDEX idx_attendance_member ON "Attendance"(member_id);
CREATE INDEX idx_session_token ON "Session"(public_token);

-- Row Level Security (RLS) 비활성화
-- anon key로 모든 데이터 접근 가능하도록 설정
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SessionMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;

-- 모든 테이블에 대해 anon 역할의 전체 권한 허용
CREATE POLICY "Allow all for anon" ON "AdminUser" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Member" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Session" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "SessionMember" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Attendance" FOR ALL USING (true) WITH CHECK (true);

-- 샘플 데이터 삽입 (선택사항)
-- 기본 관리자 계정: admin@joyful.app / admin1234
INSERT INTO "AdminUser" (email, password) VALUES
  ('admin@joyful.app', '$2a$10$YourHashedPasswordHere');
-- 비밀번호 해시는 애플리케이션에서 생성 후 수동으로 업데이트하거나
-- 애플리케이션의 회원가입 기능을 통해 생성하세요.

-- 샘플 멤버 데이터
INSERT INTO "Member" (name, phone, "group") VALUES
  ('김하늘', '010-1234-5678', '청년부'),
  ('이가은', '010-2345-6789', '청년부'),
  ('박요한', '010-3456-7890', '장년부'),
  ('최민수', '010-4567-8901', '장년부'),
  ('정현우', '010-5678-9012', '청년부');

-- 완료!
-- 이제 애플리케이션을 실행하면 Supabase 데이터베이스와 연결됩니다.
