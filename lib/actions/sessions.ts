'use server';

import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { generateToken } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createSession(name: string, note: string, date: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    const publicToken = generateToken(12);
    await prisma.session.create({
      data: {
        name,
        note: note || null,
        date: new Date(date),
        publicToken,
      },
    });

    revalidatePath('/admin/sessions');
    return { success: true };
  } catch (error) {
    console.error('Create session error:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

export async function updateSession(id: string, name: string, note: string, date: string) {
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
    // Delete all attendance records first
    await prisma.attendance.deleteMany({
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

export async function getAbsentMembers(sessionId: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const allMembers = await prisma.member.findMany({
    where: { isActive: true },
  });

  const attendance = await prisma.attendance.findMany({
    where: { sessionId },
    select: { memberId: true },
  });

  const attendedMemberIds = new Set(attendance.map((a) => a.memberId));
  return allMembers.filter((m) => !attendedMemberIds.has(m.id));
}
