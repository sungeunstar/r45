'use server';

import { supabase } from '@/lib/supabase';

export async function submitAttendance(
  sessionId: string,
  phoneLast4: string,
  status: 'attend' | 'absent',
  reason?: string
) {
  try {
    const { data, error } = await supabase
      .from('Attendance')
      .insert({
        session_id: sessionId,
        phone_last4: phoneLast4,
        status,
        reason: reason || null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Attendance submission error:', error);
    return { success: false, error: '출석 체크에 실패했습니다' };
  }
}

export async function getSessionInfo(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('Session')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: '세션을 찾을 수 없습니다' };
  }
}
