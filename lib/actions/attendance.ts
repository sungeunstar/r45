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

// OPTIMIZED: Batch fetch members
export async function exportAttendanceCSV(sessionId: string) {
  try {
    const { data: attendance, error } = await supabase
      .from('Attendance')
      .select('*')
      .eq('session_id', sessionId)
      .order('checked_at', { ascending: true });

    if (error) throw error;
    if (!attendance || attendance.length === 0) return '';

    // Get all unique member IDs
    const memberIds = [...new Set(attendance.map((att: any) => att.member_id))];

    // Fetch all members in one query
    const { data: members, error: memberError } = await supabase
      .from('Member')
      .select('*')
      .in('id', memberIds);

    if (memberError) throw memberError;

    // Create member map for quick lookup
    const memberMap = new Map();
    (members || []).forEach((member: any) => {
      memberMap.set(member.id, member);
    });

    // Generate rows
    const rows = attendance.map((att: any) => {
      const member = memberMap.get(att.member_id);
      return {
        name: member?.name || 'Unknown',
        group: member?.group || 'Unknown',
        checkedAt: att.checked_at,
        ip: att.ip || '',
      };
    });

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
