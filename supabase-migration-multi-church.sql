-- ============================================
-- Multi-Church Platform Migration
-- 멀티 교회 플랫폼 업그레이드 마이그레이션
-- ============================================
--
-- 실행 방법:
-- 1. Supabase Dashboard → SQL Editor
-- 2. 이 SQL 전체를 복사-붙여넣기
-- 3. Run 클릭
--
-- 주의: 기존 데이터가 보존됩니다.
-- ============================================

-- ============================================
-- STEP 1: 새로운 테이블 생성
-- ============================================

-- Church 테이블 (교회 정보)
CREATE TABLE IF NOT EXISTS "Church" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE, -- URL에 사용할 고유 식별자 (예: /c/myChurch)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User 테이블 (사용자 계정 - 기존 AdminUser를 대체)
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ChurchUser 테이블 (교회-사용자 연결)
CREATE TABLE IF NOT EXISTS "ChurchUser" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES "Church"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'member' 등 확장 가능
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, user_id)
);

-- Vote 테이블 (투표 기록 - 향후 확장용)
CREATE TABLE IF NOT EXISTS "Vote" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  option TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, name) -- 한 사람당 한 번만 투표
);

-- ============================================
-- STEP 2: 기존 테이블에 새 컬럼 추가
-- ============================================

-- Session 테이블 확장
ALTER TABLE "Session"
ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES "Church"(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS has_attendance BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS has_vote BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vote_options TEXT[], -- 투표 옵션 배열
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES "User"(id);

-- Member 테이블에 church_id 추가
ALTER TABLE "Member"
ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES "Church"(id) ON DELETE CASCADE;

-- Attendance 테이블 확장 (name + status 기반으로 변경)
ALTER TABLE "Attendance"
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'present', -- 'present' or 'absent'
ADD COLUMN IF NOT EXISTS reason TEXT; -- 불참 사유

-- member_id를 nullable로 변경 (기존 데이터 호환성)
ALTER TABLE "Attendance"
ALTER COLUMN member_id DROP NOT NULL;

-- ============================================
-- STEP 3: 기존 데이터 마이그레이션
-- ============================================

-- 기본 교회 생성 (기존 데이터를 위한)
INSERT INTO "Church" (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', '기본 교회', 'default')
ON CONFLICT (slug) DO NOTHING;

-- 기존 AdminUser를 User로 마이그레이션
INSERT INTO "User" (id, name, email, password, created_at)
SELECT id, COALESCE(SPLIT_PART(email, '@', 1), '관리자'), email, password, created_at
FROM "AdminUser"
ON CONFLICT (email) DO NOTHING;

-- ChurchUser 연결 생성 (모든 기존 AdminUser를 기본 교회의 admin으로)
INSERT INTO "ChurchUser" (church_id, user_id, role)
SELECT '00000000-0000-0000-0000-000000000001', id, 'admin'
FROM "AdminUser"
ON CONFLICT (church_id, user_id) DO NOTHING;

-- 기존 Session에 church_id 설정
UPDATE "Session"
SET
  church_id = '00000000-0000-0000-0000-000000000001',
  title = name -- name을 title로 복사
WHERE church_id IS NULL;

-- 기존 Member에 church_id 설정
UPDATE "Member"
SET church_id = '00000000-0000-0000-0000-000000000001'
WHERE church_id IS NULL;

-- 기존 Attendance에 name 설정 (Member 이름 복사)
UPDATE "Attendance" a
SET name = m.name
FROM "Member" m
WHERE a.member_id = m.id AND a.name IS NULL;

-- ============================================
-- STEP 4: 새로운 인덱스 생성
-- ============================================

CREATE INDEX IF NOT EXISTS idx_church_slug ON "Church"(slug);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_church_user_church ON "ChurchUser"(church_id);
CREATE INDEX IF NOT EXISTS idx_church_user_user ON "ChurchUser"(user_id);
CREATE INDEX IF NOT EXISTS idx_session_church ON "Session"(church_id);
CREATE INDEX IF NOT EXISTS idx_session_date ON "Session"(date);
CREATE INDEX IF NOT EXISTS idx_member_church ON "Member"(church_id);
CREATE INDEX IF NOT EXISTS idx_attendance_name ON "Attendance"(name);
CREATE INDEX IF NOT EXISTS idx_vote_session ON "Vote"(session_id);

-- ============================================
-- STEP 5: Row Level Security 설정
-- ============================================

ALTER TABLE "Church" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChurchUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;

-- 모든 테이블에 대해 anon 역할의 전체 권한 허용
CREATE POLICY "Allow all for anon" ON "Church" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "ChurchUser" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON "Vote" FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STEP 6: 기존 Attendance 중복 방지 제약 조건 업데이트
-- ============================================

-- 기존 member_id 기반 unique 제약 조건 삭제 (있는 경우)
-- ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_session_id_member_id_key";

-- 새로운 session_id + name 기반 unique 제약 조건 추가
-- (기존 데이터에 따라 이 부분은 수동으로 확인 필요)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_session_name ON "Attendance"(session_id, name);

-- ============================================
-- 완료!
-- ============================================
--
-- 마이그레이션 후 확인사항:
-- 1. Church 테이블에 '기본 교회' 레코드 생성 확인
-- 2. 기존 AdminUser가 User + ChurchUser로 복사되었는지 확인
-- 3. 기존 Session에 church_id가 설정되었는지 확인
-- 4. 기존 Member에 church_id가 설정되었는지 확인
-- 5. 기존 Attendance에 name이 설정되었는지 확인
--
-- 참고: AdminUser 테이블은 이후 삭제해도 됩니다.
-- DROP TABLE IF EXISTS "AdminUser" CASCADE;
