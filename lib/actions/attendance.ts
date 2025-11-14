'use server';

import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function checkInAttendance(publicToken: string, phoneNumber: string) {
  try {
    // Get session by token
    const { data: session, error: sessionError } = await supabase
      .from('Session')
      .select('*')
      .eq('public_token', publicToken)
      .single();

    if (sessionError || !session) {
      return { success: false, error: '세션을 찾을 수 없습니다' };
    }

    // Find member by phone number
    const { data: member, error: memberError } = await supabase
      .from('Member')
      .select('*')
      .eq('phone', phoneNumber)
      .eq('is_active', true)
      .single();

    if (memberError || !member) {
      return { success: false, error: '등록되지 않은 전화번호입니다' };
    }

    // Check if member is invited to this session
    const { data: invited } = await supabase
      .from('SessionMember')
      .select('*')
      .eq('session_id', session.id)
      .eq('member_id', member.id)
      .single();

    if (!invited) {
      return { success: false, error: '이 세션에 초대되지 않은 멤버입니다' };
    }

    // Check if already checked in
    const { data: existing } = await supabase
      .from('Attendance')
      .select('*')
      .eq('session_id', session.id)
      .eq('member_id', member.id)
      .single();

    if (existing) {
      return {
        success: true,
        duplicate: true,
        checkedAt: existing.checked_at,
        memberName: member.name,
        memberGroup: member.group,
      };
    }

    // Get IP and User Agent
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Create attendance record
    const { data: attendance, error: attendanceError } = await supabase
      .from('Attendance')
      .insert({
        session_id: session.id,
        member_id: member.id,
        ip,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (attendanceError) throw attendanceError;

    return {
      success: true,
      duplicate: false,
      checkedAt: attendance.checked_at,
      memberName: member.name,
      memberGroup: member.group,
    };
  } catch (error) {
    console.error('Check-in error:', error);
    return { success: false, error: '출석 처리 실패' };
  }
}

export async function exportAttendanceCSV(sessionId: string) {
  try {
    const { data: attendance, error } = await supabase
      .from('Attendance')
      .select('*')
      .eq('session_id', sessionId)
      .order('checked_at', { ascending: true });

    if (error) throw error;

    // Get member details for each attendance
    const rows = await Promise.all(
      (attendance || []).map(async (att: any) => {
        const { data: member } = await supabase
          .from('Member')
          .select('*')
          .eq('id', att.member_id)
          .single();

        return {
          name: member?.name || 'Unknown',
          group: member?.group || 'Unknown',
          checkedAt: att.checked_at,
          ip: att.ip || '',
        };
      })
    );

    // Generate CSV
    const csvHeaders = ['Name', 'Group', 'Checked At', 'IP'];
    const csvRows = [
      csvHeaders.join(','),
      ...rows.map((row) =>
        [row.name, row.group, row.checkedAt, row.ip].join(',')
      ),
    ];

    return csvRows.join('\n');
  } catch (error) {
    console.error('Export CSV error:', error);
    return null;
  }
}
