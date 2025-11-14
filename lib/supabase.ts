import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Only throw error in runtime, not during build
if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface AdminUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  group: string;
  is_active: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  name: string;
  note: string | null;
  date: string;
  public_token: string;
  created_at: string;
}

export interface SessionMember {
  id: string;
  session_id: string;
  member_id: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  session_id: string;
  member_id: string;
  checked_at: string;
  ip: string | null;
  user_agent: string | null;
}
