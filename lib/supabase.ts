import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Only throw error in runtime, not during build
if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Database Types - 멀티 교회 플랫폼
// ============================================

// 교회 정보
export interface Church {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
}

// 사용자 계정
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: string;
}

// 교회-사용자 연결
export interface ChurchUser {
  id: string;
  church_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
}

// 기존 AdminUser (하위 호환성)
export interface AdminUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

// 교회 구성원
export interface Member {
  id: string;
  name: string;
  phone: string;
  group: string;
  is_active: boolean;
  church_id: string | null;
  created_at: string;
}

// 일정(세션)
export interface Session {
  id: string;
  church_id: string | null;
  name: string; // 기존 필드 (하위 호환성)
  title: string | null; // 새 필드
  note: string | null;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  has_attendance: boolean;
  has_vote: boolean;
  vote_options: string[] | null;
  created_by: string | null;
  public_token: string;
  created_at: string;
}

// 세션별 참여 구성원
export interface SessionMember {
  id: string;
  session_id: string;
  member_id: string;
  created_at: string;
}

// 출석 기록
export interface Attendance {
  id: string;
  session_id: string;
  member_id: string | null; // nullable for name-based attendance
  name: string | null;
  status: 'present' | 'absent';
  reason: string | null;
  checked_at: string;
  ip: string | null;
  user_agent: string | null;
}

// 투표 기록
export interface Vote {
  id: string;
  session_id: string;
  name: string;
  option: string;
  created_at: string;
}

// ============================================
// Extended Types (조인된 데이터용)
// ============================================

// 교회 정보와 함께 로드된 사용자
export interface UserWithChurch extends User {
  churches: {
    church: Church;
    role: string;
  }[];
}

// 출석 정보와 함께 로드된 세션
export interface SessionWithAttendance extends Session {
  attendance_count: number;
  present_count: number;
  absent_count: number;
}

// 세션 정보와 함께 로드된 출석
export interface AttendanceWithSession extends Attendance {
  session: Session;
}
