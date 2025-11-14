'use server';

import { supabase } from '@/lib/supabase';
import { isAuthenticated } from '@/lib/auth';
import { generateToken } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
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
    return { success: true };
  } catch (error) {
    console.error('Delete session error:', error);
    return { success: false, error: 'Failed to delete session' };
  }
}

export async function getAllSessions() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const { data: sessions, error } = await supabase
    .from('Session')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;

  // Get attendance counts for each session
  const sessionsWithCounts = await Promise.all(
    (sessions || []).map(async (session: any) => {
      const { count } = await supabase
        .from('Attendance')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id);

      return {
        ...session,
        attendanceCount: count || 0,
      };
    })
  );

  return sessionsWithCounts;
}

export async function getSessionById(id: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const { data, error } = await supabase
    .from('Session')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
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

export async function getSessionAttendance(sessionId: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const { data: attendance, error } = await supabase
    .from('Attendance')
    .select('*')
    .eq('session_id', sessionId)
    .order('checked_at', { ascending: true });

  if (error) throw error;

  // Get member details for each attendance
  const attendanceWithMembers = await Promise.all(
    (attendance || []).map(async (att: any) => {
      const { data: member } = await supabase
        .from('Member')
        .select('*')
        .eq('id', att.member_id)
        .single();

      return {
        ...att,
        memberName: member?.name || 'Unknown',
        memberGroup: member?.group || 'Unknown',
      };
    })
  );

  return attendanceWithMembers;
}

export async function getSessionMembers(sessionId: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const { data: sessionMembers, error } = await supabase
    .from('SessionMember')
    .select('*')
    .eq('session_id', sessionId);

  if (error) throw error;

  const members = await Promise.all(
    (sessionMembers || []).map(async (sm: any) => {
      const { data: member } = await supabase
        .from('Member')
        .select('*')
        .eq('id', sm.member_id)
        .single();

      return member;
    })
  );

  return members.filter((m) => m !== null);
}

export async function getInvitedMembers(sessionToken: string) {
  const { data: session } = await supabase
    .from('Session')
    .select('*')
    .eq('public_token', sessionToken)
    .single();

  if (!session) return [];

  const { data: sessionMembers } = await supabase
    .from('SessionMember')
    .select('*')
    .eq('session_id', session.id);

  const members = await Promise.all(
    (sessionMembers || []).map(async (sm: any) => {
      const { data: member } = await supabase
        .from('Member')
        .select('*')
        .eq('id', sm.member_id)
        .single();

      return member;
    })
  );

  return members.filter((m) => m !== null);
}

export async function getAbsentMembers(sessionId: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  // Get invited members for this session
  const invitedMembers = await getSessionMembers(sessionId);

  const { data: attendance } = await supabase
    .from('Attendance')
    .select('member_id')
    .eq('session_id', sessionId);

  const attendedMemberIds = new Set((attendance || []).map((a: any) => a.member_id));
  return invitedMembers.filter((m) => !attendedMemberIds.has(m.id));
}
