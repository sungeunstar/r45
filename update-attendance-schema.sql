-- Attendance 테이블 스키마 업데이트
-- Supabase Dashboard → SQL Editor에서 실행하세요

-- 1. member_id를 nullable로 변경
ALTER TABLE "Attendance" ALTER COLUMN member_id DROP NOT NULL;

-- 2. 새로운 필드 추가
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS phone_last4 TEXT;
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS reason TEXT;

-- 3. 기존 UNIQUE 제약 조건 삭제 (session_id, member_id)
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_session_id_member_id_key";

-- 4. 새로운 UNIQUE 제약 조건 추가 (같은 세션에서 같은 번호로 중복 출석 방지)
-- 이건 선택사항입니다. 필요하다면 주석 해제하세요:
-- ALTER TABLE "Attendance" ADD CONSTRAINT unique_session_phone UNIQUE(session_id, phone_last4);
