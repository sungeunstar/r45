'use server';

import { prisma } from '@/lib/prisma';
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
    const session = await prisma.session.create({
      data: {
        name,
        note: note || null,
        date: new Date(date),
        publicToken,
      },
    });

    // Add selected members to session
    if (memberIds.length > 0) {
      await prisma.sessionMember.createMany({
        data: memberIds.map(memberId => ({
          sessionId: session.id,
          memberId,
        })),
      });
    }

    revalidatePath('/admin/sessions');
    return { success: true };
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
    await prisma.session.update({
      where: { id },
      data: {
        name,
        note: note || null,
        date: new Date(date),
      },
    });

    // Update session members
    await prisma.sessionMember.deleteMany({
      where: { sessionId: id },
    });

    if (memberIds.length > 0) {
      await prisma.sessionMember.createMany({
        data: memberIds.map(memberId => ({
          sessionId: id,
          memberId,
        })),
      });
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
    // Delete all related records first
    await prisma.attendance.deleteMany({
      where: { sessionId: id },
    });

    await prisma.sessionMember.deleteMany({
      where: { sessionId: id },
    });

    await prisma.session.delete({
      where: { id },
    });

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

  const sessions = await prisma.session.findMany({
    orderBy: { date: 'desc' },
  });

  // Get attendance counts for each session
  const sessionsWithCounts = await Promise.all(
    sessions.map(async (session) => {
      const attendanceCount = await prisma.attendance.count({
        where: { sessionId: session.id },
      });
      return {
        ...session,
        attendanceCount,
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

  return await prisma.session.findUnique({
    where: { id },
  });
}

export async function getSessionByToken(token: string) {
  return await prisma.session.findUnique({
    where: { publicToken: token },
  });
}

export async function getSessionAttendance(sessionId: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const attendance = await prisma.attendance.findMany({
    where: { sessionId },
    orderBy: { checkedAt: 'asc' },
  });

  // Get member details for each attendance
  const attendanceWithMembers = await Promise.all(
    attendance.map(async (att) => {
      const member = await prisma.member.findUnique({
        where: { id: att.memberId },
      });
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

  const sessionMembers = await prisma.sessionMember.findMany({
    where: { sessionId },
  });

  const members = await Promise.all(
    sessionMembers.map(async (sm) => {
      const member = await prisma.member.findUnique({
        where: { id: sm.memberId },
      });
      return member;
    })
  );

  return members.filter((m) => m !== null);
}

export async function getInvitedMembers(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { publicToken: sessionToken },
  });

  if (!session) return [];

  const sessionMembers = await prisma.sessionMember.findMany({
    where: { sessionId: session.id },
  });

  const members = await Promise.all(
    sessionMembers.map(async (sm) => {
      const member = await prisma.member.findUnique({
        where: { id: sm.memberId },
      });
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

  const attendance = await prisma.attendance.findMany({
    where: { sessionId },
    select: { memberId: true },
  });

  const attendedMemberIds = new Set(attendance.map((a) => a.memberId));
  return invitedMembers.filter((m) => !attendedMemberIds.has(m.id));
}
