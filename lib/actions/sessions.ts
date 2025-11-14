'use server';

import { supabase } from '@/lib/supabase';
import { isAuthenticated } from '@/lib/auth';
import { generateToken } from '@/lib/utils';
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createSession(name: string, note: string, date: string, memberIds: string[]) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    const publicToken = generateToken(12);
    const { data: session, error } = await supabase
      .from('Session')
      .insert({
        name,
        note: note || null,
        date: new Date(date).toISOString(),
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
            session_id: session.id,
            member_id: memberId,
          }))
        );

      if (memberError) throw memberError;
    }

    revalidatePath('/admin/sessions');
    revalidateTag('sessions');
    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error('Create session error:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

export async function updateSession(id: string, name: string, note: string, date: string, memberIds: string[]) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    const { error } = await supabase
      .from('Session')
      .update({
        name,
        note: note || null,
        date: new Date(date).toISOString(),
      })
      .eq('id', id);

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
    revalidatePath(`/admin/sessions/${id}`);
    revalidateTag('sessions');
    return { success: true };
  } catch (error) {
    console.error('Update session error:', error);
    return { success: false, error: 'Failed to update session' };
  }
}

export async function deleteSession(id: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    // Supabase CASCADE will handle deletion of related records
    const { error } = await supabase
      .from('Session')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/sessions');
    revalidateTag('sessions');
    return { success: true };
  } catch (error) {
    console.error('Delete session error:', error);
    return { success: false, error: 'Failed to delete session' };
  }
}

// OPTIMIZED: Use RPC to get attendance counts in single query
// Cached data fetching (no auth check - must be called from authenticated context)
const getAllSessionsCached = unstable_cache(
  async () => {
    // Get all sessions
    const { data: sessions, error: sessionError } = await supabase
      .from('Session')
      .select('*')
      .order('date', { ascending: false });

    if (sessionError) throw sessionError;
    if (!sessions || sessions.length === 0) return [];

    // Get all attendance counts in one query
    const sessionIds = sessions.map(s => s.id);
    const { data: attendanceCounts, error: countError } = await supabase
      .from('Attendance')
      .select('session_id')
      .in('session_id', sessionIds);

    if (countError) throw countError;

    // Count attendances per session
    const countMap = new Map<string, number>();
    (attendanceCounts || []).forEach((att: any) => {
      countMap.set(att.session_id, (countMap.get(att.session_id) || 0) + 1);
    });

    // Combine results
    return sessions.map(session => ({
      ...session,
      attendanceCount: countMap.get(session.id) || 0,
    }));
  },
  ['sessions'],
  { revalidate: 60, tags: ['sessions'] }
);

// Wrapper with auth check
export async function getAllSessions() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }
  return getAllSessionsCached();
}

const getSessionByIdCached = (id: string) =>
  unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('Session')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    ['session', id],
    { revalidate: 60, tags: ['sessions', `session-${id}`] }
  )();

export async function getSessionById(id: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  return getSessionByIdCached(id);
}

export async function getSessionByToken(token: string) {
  const { data, error } = await supabase
    .from('Session')
    .select('*')
    .eq('public_token', token)
    .single();

  if (error) return null;
  return data;
}

// OPTIMIZED: Get all member IDs first, then fetch members in one query
const getSessionAttendanceCached = (sessionId: string) =>
  unstable_cache(
    async () => {
      const { data: attendance, error } = await supabase
        .from('Attendance')
        .select('*')
        .eq('session_id', sessionId)
        .order('checked_at', { ascending: true });

      if (error) throw error;
      if (!attendance || attendance.length === 0) return [];

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

      // Combine results
      return attendance.map((att: any) => {
        const member = memberMap.get(att.member_id);
        return {
          ...att,
          memberName: member?.name || 'Unknown',
          memberGroup: member?.group || 'Unknown',
        };
      });
    },
    ['session-attendance', sessionId],
    { revalidate: 30, tags: [`session-${sessionId}-attendance`] }
  )();

export async function getSessionAttendance(sessionId: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  return getSessionAttendanceCached(sessionId);
}

// OPTIMIZED: Get all members in one query using IN
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

  // Fetch all members in one query
  const { data: members, error: memberError } = await supabase
    .from('Member')
    .select('*')
    .in('id', memberIds);

  if (memberError) throw memberError;
  return members || [];
}

// OPTIMIZED: Get all members in one query
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

  // Fetch all members in one query
  const { data: members } = await supabase
    .from('Member')
    .select('*')
    .in('id', memberIds);

  return members || [];
}

const getAbsentMembersCached = (sessionId: string) =>
  unstable_cache(
    async () => {
      // Get session to ensure it exists (reuse cached function)
      const { data: session } = await supabase
        .from('Session')
        .select('id')
        .eq('id', sessionId)
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
      const attendedMemberIds = new Set(attendance.map((a: any) => a.member_id));

      // Get absent member IDs
      const absentMemberIds = memberIds.filter(id => !attendedMemberIds.has(id));

      if (absentMemberIds.length === 0) return [];

      // Fetch all absent members in one query
      const { data: members } = await supabase
        .from('Member')
        .select('*')
        .in('id', absentMemberIds);

      return members || [];
    },
    ['session-absent', sessionId],
    { revalidate: 30, tags: [`session-${sessionId}-attendance`] }
  )();

export async function getAbsentMembers(sessionId: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  return getAbsentMembersCached(sessionId);
}
