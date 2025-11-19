'use server';

import { supabase, Session } from '@/lib/supabase';
import { getSession, isAuthenticated } from '@/lib/auth';
import { generateToken } from '@/lib/utils';
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

// 현재 사용자의 church_id 가져오기
async function getCurrentChurchId(): Promise<string> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.churchId) {
    redirect('/admin/login');
  }
  return session.churchId;
}

// 일정(세션) 생성 - 새 필드 지원
export async function createSession(
  name: string,
  note: string,
  date: string,
  memberIds: string[],
  options?: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    hasAttendance?: boolean;
    hasVote?: boolean;
    voteOptions?: string[];
  }
) {
  const churchId = await getCurrentChurchId();
  const session = await getSession();

  try {
    const publicToken = generateToken(12);
    const { data: newSession, error } = await supabase
      .from('Session')
      .insert({
        church_id: churchId,
        name,
        title: options?.title || name,
        note: note || null,
        description: options?.description || note || null,
        date: new Date(date).toISOString(),
        start_time: options?.startTime || null,
        end_time: options?.endTime || null,
        has_attendance: options?.hasAttendance ?? true,
        has_vote: options?.hasVote ?? false,
        vote_options: options?.voteOptions || null,
        created_by: session.userId,
        public_token: publicToken,
      })
      .select()
      .single();

    if (error) throw error;

    // Add selected members to session
    if (memberIds.length > 0) {
      const { error: memberError } = await supabase
        .from('SessionMember')
        .insert(
          memberIds.map(memberId => ({
            session_id: newSession.id,
            member_id: memberId,
          }))
        );

      if (memberError) throw memberError;
    }

    revalidatePath('/admin/sessions');
    revalidatePath('/admin');
    revalidateTag('sessions');
    return { success: true, sessionId: newSession.id };
  } catch (error) {
    console.error('Create session error:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

// 일정(세션) 수정 - 새 필드 지원
export async function updateSession(
  id: string,
  name: string,
  note: string,
  date: string,
  memberIds: string[],
  options?: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    hasAttendance?: boolean;
    hasVote?: boolean;
    voteOptions?: string[];
  }
) {
  const churchId = await getCurrentChurchId();

  try {
    const { error } = await supabase
      .from('Session')
      .update({
        name,
        title: options?.title || name,
        note: note || null,
        description: options?.description || note || null,
        date: new Date(date).toISOString(),
        start_time: options?.startTime || null,
        end_time: options?.endTime || null,
        has_attendance: options?.hasAttendance ?? true,
        has_vote: options?.hasVote ?? false,
        vote_options: options?.voteOptions || null,
      })
      .eq('id', id)
      .eq('church_id', churchId); // 자기 교회만 수정 가능

    if (error) throw error;

    // Update session members
    const { error: deleteError } = await supabase
      .from('SessionMember')
      .delete()
      .eq('session_id', id);

    if (deleteError) throw deleteError;

    if (memberIds.length > 0) {
      const { error: memberError } = await supabase
        .from('SessionMember')
        .insert(
          memberIds.map(memberId => ({
            session_id: id,
            member_id: memberId,
          }))
        );

      if (memberError) throw memberError;
    }

    revalidatePath('/admin/sessions');
    revalidatePath('/admin');
    revalidatePath(`/admin/sessions/${id}`);
    revalidateTag('sessions');
    return { success: true };
  } catch (error) {
    console.error('Update session error:', error);
    return { success: false, error: 'Failed to update session' };
  }
}

// 일정(세션) 삭제
export async function deleteSession(id: string) {
  const churchId = await getCurrentChurchId();

  try {
    // 자기 교회의 세션만 삭제 가능
    const { error } = await supabase
      .from('Session')
      .delete()
      .eq('id', id)
      .eq('church_id', churchId);

    if (error) throw error;

    revalidatePath('/admin/sessions');
    revalidatePath('/admin');
    revalidateTag('sessions');
    return { success: true };
  } catch (error) {
    console.error('Delete session error:', error);
    return { success: false, error: 'Failed to delete session' };
  }
}

// 모든 일정 조회 (자기 교회만) - 캐시 사용
export async function getAllSessions() {
  const churchId = await getCurrentChurchId();

  // church_id가 동적이므로 캐시 키에 포함
  const getCachedSessions = unstable_cache(
    async (cId: string) => {
      // Get all sessions for this church
      // 마이그레이션 전에는 church_id 컬럼이 없을 수 있으므로 폴백 처리
      let sessions;
      const { data, error: sessionError } = await supabase
        .from('Session')
        .select('*')
        .order('date', { ascending: false });

      if (sessionError) throw sessionError;

      // church_id가 있는 경우만 필터링, 없으면 전체 반환
      sessions = (data || []).filter((s: any) =>
        !s.church_id || s.church_id === cId
      );

      if (!sessions || sessions.length === 0) return [];

      // Get all attendance counts in one query
      const sessionIds = sessions.map((s: any) => s.id);
      const { data: attendanceCounts, error: countError } = await supabase
        .from('Attendance')
        .select('session_id')
        .in('session_id', sessionIds);

      if (countError) throw countError;

      // Count attendances per session
      const countMap = new Map<string, { total: number; present: number; absent: number }>();
      (attendanceCounts || []).forEach((att: any) => {
        const current = countMap.get(att.session_id) || { total: 0, present: 0, absent: 0 };
        current.total++;
        current.present++;
        countMap.set(att.session_id, current);
      });

      // Combine results
      return sessions.map((session: any) => ({
        ...session,
        attendanceCount: countMap.get(session.id)?.total || 0,
        presentCount: countMap.get(session.id)?.present || 0,
        absentCount: countMap.get(session.id)?.absent || 0,
      }));
    },
    ['sessions', churchId],
    { revalidate: 60, tags: ['sessions'] }
  );

  return getCachedSessions(churchId);
}

// 교회의 모든 일정 조회 (공개용 - churchId로)
export async function getSessionsByChurchId(churchId: string) {
  const { data: sessions, error } = await supabase
    .from('Session')
    .select('*')
    .eq('church_id', churchId)
    .order('date', { ascending: false });

  if (error) return [];
  return sessions || [];
}

// 교회의 월간 일정 조회 (캘린더용)
export async function getSessionsByMonth(churchId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data: sessions, error } = await supabase
    .from('Session')
    .select('*')
    .eq('church_id', churchId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) return [];
  return sessions || [];
}

// 단일 일정 조회 (인증 필요)
export async function getSessionById(id: string) {
  const churchId = await getCurrentChurchId();

  // 마이그레이션 전에는 church_id 컬럼이 없을 수 있으므로 id만으로 조회
  const { data, error } = await supabase
    .from('Session')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  // church_id가 있는 경우만 검증, 없으면 통과
  if (data?.church_id && data.church_id !== churchId) {
    return null;
  }

  return data as Session;
}

// 단일 일정 조회 (공개용 - token으로)
export async function getSessionByToken(token: string) {
  const { data, error } = await supabase
    .from('Session')
    .select('*')
    .eq('public_token', token)
    .single();

  if (error) return null;
  return data as Session;
}

// 단일 일정 조회 (공개용 - id로)
export async function getPublicSessionById(sessionId: string) {
  const { data, error } = await supabase
    .from('Session')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) return null;
  return data as Session;
}

// 일정의 출석 현황 조회
export async function getSessionAttendance(sessionId: string) {
  const churchId = await getCurrentChurchId();

  // 먼저 세션이 자기 교회 것인지 확인
  const { data: session } = await supabase
    .from('Session')
    .select('id')
    .eq('id', sessionId)
    .eq('church_id', churchId)
    .single();

  if (!session) return [];

  const { data: attendance, error } = await supabase
    .from('Attendance')
    .select('*')
    .eq('session_id', sessionId)
    .order('checked_at', { ascending: true });

  if (error) throw error;
  if (!attendance || attendance.length === 0) return [];

  // member_id가 있는 경우 멤버 정보 조회
  const memberIds = [...new Set(attendance.filter((att: any) => att.member_id).map((att: any) => att.member_id))];

  let memberMap = new Map();
  if (memberIds.length > 0) {
    const { data: members } = await supabase
      .from('Member')
      .select('*')
      .in('id', memberIds);

    (members || []).forEach((member: any) => {
      memberMap.set(member.id, member);
    });
  }

  // Combine results
  return attendance.map((att: any) => {
    const member = att.member_id ? memberMap.get(att.member_id) : null;
    return {
      ...att,
      memberName: att.name || member?.name || 'Unknown',
      memberGroup: member?.group || '',
    };
  });
}

// 일정의 멤버 목록 조회
export async function getSessionMembers(sessionId: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const { data: sessionMembers, error } = await supabase
    .from('SessionMember')
    .select('member_id')
    .eq('session_id', sessionId);

  if (error) throw error;
  if (!sessionMembers || sessionMembers.length === 0) return [];

  const memberIds = sessionMembers.map((sm: any) => sm.member_id);

  const { data: members, error: memberError } = await supabase
    .from('Member')
    .select('*')
    .in('id', memberIds);

  if (memberError) throw memberError;
  return members || [];
}

// 공개용 초대된 멤버 조회
export async function getInvitedMembers(sessionToken: string) {
  const { data: session } = await supabase
    .from('Session')
    .select('*')
    .eq('public_token', sessionToken)
    .single();

  if (!session) return [];

  const { data: sessionMembers } = await supabase
    .from('SessionMember')
    .select('member_id')
    .eq('session_id', session.id);

  if (!sessionMembers || sessionMembers.length === 0) return [];

  const memberIds = sessionMembers.map((sm: any) => sm.member_id);

  const { data: members } = await supabase
    .from('Member')
    .select('*')
    .in('id', memberIds);

  return members || [];
}

// 불참 멤버 조회
export async function getAbsentMembers(sessionId: string) {
  const churchId = await getCurrentChurchId();

  // 세션이 자기 교회 것인지 확인
  const { data: session } = await supabase
    .from('Session')
    .select('id')
    .eq('id', sessionId)
    .eq('church_id', churchId)
    .single();

  if (!session) return [];

  // Parallel fetch: invited members and attendance
  const [sessionMembersData, attendanceData] = await Promise.all([
    supabase
      .from('SessionMember')
      .select('member_id')
      .eq('session_id', session.id),
    supabase
      .from('Attendance')
      .select('member_id')
      .eq('session_id', sessionId)
  ]);

  const sessionMembers = sessionMembersData.data || [];
  const attendance = attendanceData.data || [];

  if (sessionMembers.length === 0) return [];

  const memberIds = sessionMembers.map((sm: any) => sm.member_id);
  const attendedMemberIds = new Set(attendance.filter((a: any) => a.member_id).map((a: any) => a.member_id));

  // Get absent member IDs
  const absentMemberIds = memberIds.filter(id => !attendedMemberIds.has(id));

  if (absentMemberIds.length === 0) return [];

  const { data: members } = await supabase
    .from('Member')
    .select('*')
    .in('id', absentMemberIds);

  return members || [];
}

// 출석 기록 저장 (name + status 기반)
export async function submitAttendance(
  sessionId: string,
  name: string,
  status: 'present' | 'absent',
  reason?: string,
  ip?: string,
  userAgent?: string
) {
  try {
    // 중복 체크 (session_id + name)
    const { data: existing } = await supabase
      .from('Attendance')
      .select('id')
      .eq('session_id', sessionId)
      .eq('name', name)
      .single();

    if (existing) {
      return { success: false, error: '이미 제출되었습니다.' };
    }

    const { error } = await supabase
      .from('Attendance')
      .insert({
        session_id: sessionId,
        name,
        status,
        reason: reason || null,
        ip: ip || null,
        user_agent: userAgent || null,
      });

    if (error) throw error;

    revalidateTag(`session-${sessionId}-attendance`);
    return { success: true };
  } catch (error) {
    console.error('Submit attendance error:', error);
    return { success: false, error: '출석 제출에 실패했습니다.' };
  }
}

// 기존 출석 확인 (name 기반)
export async function getExistingAttendance(sessionId: string, name: string) {
  const { data, error } = await supabase
    .from('Attendance')
    .select('*')
    .eq('session_id', sessionId)
    .eq('name', name)
    .single();

  if (error) return null;
  return data;
}
