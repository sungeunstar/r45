-- ============================================
-- Joyful Church 예배팀 출석 시스템
-- Supabase Database Schema v2
-- ============================================
--
-- 실행 방법:
-- 1. Supabase Dashboard → SQL Editor
-- 2. 아래 전체 SQL을 복사-붙여넣기
-- 3. Run 클릭
--
-- ============================================

-- 기존 테이블 삭제 (깔끔하게 재시작)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS session_members CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- ENUM 타입 생성
DROP TYPE IF EXISTS session_status CASCADE;
CREATE TYPE session_status AS ENUM ('planned', 'opened', 'closed');

DROP TYPE IF EXISTS attendance_status CASCADE;
CREATE TYPE attendance_status AS ENUM ('attend', 'absent', 'late');

-- ============================================
-- 1. admin_users (관리자)
-- ============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. members (멤버)
-- ============================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_full TEXT UNIQUE NOT NULL, -- 전체 번호 (010-1234-5678)
  phone_last4 TEXT NOT NULL CHECK (length(phone_last4) = 4), -- 뒷자리 4자리
  part TEXT NOT NULL, -- vocal, keys, drums, guitar, bass, etc
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false, -- soft delete
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- phone_last4는 UNIQUE 아님 (여러 사람이 같은 뒷자리 가능)
-- phone_full만 UNIQUE
CREATE INDEX idx_members_phone_last4 ON members(phone_last4);
CREATE INDEX idx_members_is_active ON members(is_active);
CREATE INDEX idx_members_is_deleted ON members(is_deleted);

COMMENT ON TABLE members IS '예배팀 멤버 정보';
COMMENT ON COLUMN members.phone_last4 IS '핸드폰 뒷자리 4자리 (출석 체크용)';
COMMENT ON COLUMN members.phone_full IS '전체 핸드폰 번호 (UNIQUE)';

-- ============================================
-- 3. sessions (세션)
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  status session_status DEFAULT 'opened',
  public_token TEXT UNIQUE NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- name + date 조합으로 UNIQUE (같은 날짜에 같은 이름 불가)
  CONSTRAINT unique_session_name_date UNIQUE(name, date)
);

CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_public_token ON sessions(public_token);
CREATE INDEX idx_sessions_is_deleted ON sessions(is_deleted);

COMMENT ON TABLE sessions IS '예배 세션';
COMMENT ON COLUMN sessions.status IS 'planned(계획됨), opened(출석가능), closed(종료)';
COMMENT ON COLUMN sessions.public_token IS '공개 출석 링크용 토큰';
COMMENT ON CONSTRAINT unique_session_name_date ON sessions IS '같은 날짜에 같은 이름의 세션 생성 불가';

-- ============================================
-- 4. session_members (세션별 초대 멤버)
-- ============================================
CREATE TABLE session_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_session_member UNIQUE(session_id, member_id)
);

CREATE INDEX idx_session_members_session ON session_members(session_id);
CREATE INDEX idx_session_members_member ON session_members(member_id);

COMMENT ON TABLE session_members IS '세션별 참여 예정 멤버';

-- ============================================
-- 5. attendance (출석 기록)
-- ============================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  phone_last4 TEXT NOT NULL CHECK (length(phone_last4) = 4),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL, -- nullable (매칭 실패 가능)
  status attendance_status NOT NULL,
  reason TEXT, -- 불참/지각 사유
  ip TEXT,
  user_agent TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 출석 방지: 같은 세션에서 같은 번호로 여러 번 출석 불가
  CONSTRAINT unique_session_phone UNIQUE(session_id, phone_last4)
);

CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_attendance_phone_last4 ON attendance(phone_last4);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_is_deleted ON attendance(is_deleted);

COMMENT ON TABLE attendance IS '출석 기록';
COMMENT ON COLUMN attendance.phone_last4 IS '출석 체크한 핸드폰 뒷자리 4자리';
COMMENT ON COLUMN attendance.member_id IS '매칭된 멤버 (nullable, 자동 매칭 실패 시 NULL)';
COMMENT ON COLUMN attendance.status IS 'attend(참석), absent(불참), late(지각)';
COMMENT ON CONSTRAINT unique_session_phone ON attendance IS '같은 세션에서 같은 전화번호로 중복 출석 방지';

-- ============================================
-- Auto-update updated_at 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) 설정
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- anon 역할에 모든 권한 허용 (개발 편의용)
CREATE POLICY "Allow all for anon" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON session_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON attendance FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 샘플 데이터
-- ============================================

-- 관리자 계정: admin@joyful.app / admin1234
INSERT INTO admin_users (email, password) VALUES
  ('admin@joyful.app', '$2a$10$HeoPaGRGiHEldTiTdwRv4OGYqUsGAc8kQiFvx3c/lqlOQaYWNT58m');

-- 멤버 데이터
INSERT INTO members (name, phone_full, phone_last4, part) VALUES
  ('김하늘', '010-1234-5678', '5678', 'vocal'),
  ('이가은', '010-2345-6789', '6789', 'keys'),
  ('박요한', '010-3456-7890', '7890', 'drums'),
  ('최민수', '010-4567-8901', '8901', 'guitar'),
  ('정현우', '010-5678-9012', '9012', 'bass');

-- ============================================
-- 헬퍼 함수들
-- ============================================

-- 함수: phone_last4로 멤버 자동 매칭
CREATE OR REPLACE FUNCTION match_member_by_phone(p_phone_last4 TEXT)
RETURNS UUID AS $$
DECLARE
  v_member_id UUID;
  v_count INT;
BEGIN
  -- 해당 뒷자리를 가진 활성 멤버 수 확인
  SELECT COUNT(*), MAX(id) INTO v_count, v_member_id
  FROM members
  WHERE phone_last4 = p_phone_last4
    AND is_active = true
    AND is_deleted = false;

  -- 정확히 1명이면 자동 매칭, 아니면 NULL 반환
  IF v_count = 1 THEN
    RETURN v_member_id;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION match_member_by_phone IS '핸드폰 뒷자리로 멤버 자동 매칭 (1명일 경우만)';

-- ============================================
-- 쿼리 예시
-- ============================================

-- [예시 1] 출석 기록 조회 (중복 체크)
-- SELECT * FROM attendance
-- WHERE session_id = 'xxx' AND phone_last4 = '1234';

-- [예시 2] 출석 기록 삽입 (신규)
-- INSERT INTO attendance (session_id, phone_last4, member_id, status, reason)
-- VALUES (
--   'session-uuid',
--   '1234',
--   match_member_by_phone('1234'), -- 자동 매칭
--   'attend',
--   NULL
-- )
-- ON CONFLICT (session_id, phone_last4) DO NOTHING;

-- [예시 3] 출석 상태 수정 (기존 레코드)
-- UPDATE attendance
-- SET status = 'absent',
--     reason = '개인 사정',
--     updated_at = NOW()
-- WHERE session_id = 'xxx' AND phone_last4 = '1234';

-- [예시 4] UPSERT (있으면 UPDATE, 없으면 INSERT)
-- INSERT INTO attendance (session_id, phone_last4, member_id, status, reason)
-- VALUES (
--   'session-uuid',
--   '1234',
--   match_member_by_phone('1234'),
--   'attend',
--   NULL
-- )
-- ON CONFLICT (session_id, phone_last4)
-- DO UPDATE SET
--   status = EXCLUDED.status,
--   reason = EXCLUDED.reason,
--   updated_at = NOW();

-- [예시 5] 세션 생성 (중복 체크)
-- INSERT INTO sessions (name, date, status, public_token)
-- VALUES ('주일예배', '2025-01-19', 'opened', 'random-token-12345')
-- ON CONFLICT (name, date) DO NOTHING;

-- [예시 6] 출석 현황 조회 (멤버 정보 포함)
-- SELECT
--   a.id,
--   a.phone_last4,
--   a.status,
--   a.reason,
--   a.created_at,
--   m.name AS member_name,
--   m.part AS member_part
-- FROM attendance a
-- LEFT JOIN members m ON a.member_id = m.id
-- WHERE a.session_id = 'xxx'
--   AND a.is_deleted = false
-- ORDER BY a.created_at ASC;

-- [예시 7] 세션별 출석률 통계
-- SELECT
--   s.name,
--   s.date,
--   COUNT(a.id) FILTER (WHERE a.status = 'attend') AS attend_count,
--   COUNT(a.id) FILTER (WHERE a.status = 'absent') AS absent_count,
--   COUNT(a.id) FILTER (WHERE a.status = 'late') AS late_count,
--   COUNT(sm.id) AS total_invited
-- FROM sessions s
-- LEFT JOIN session_members sm ON s.id = sm.session_id
-- LEFT JOIN attendance a ON s.id = a.session_id AND a.is_deleted = false
-- WHERE s.id = 'xxx'
-- GROUP BY s.id, s.name, s.date;

-- ============================================
-- 완료!
-- ============================================
