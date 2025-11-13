'use server';

import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function checkInAttendance(publicToken: string, memberId: string) {
  try {
    // Get session by token
    const session = await prisma.session.findUnique({
      where: { publicToken },
    });

    if (!session) {
      return { success: false, error: 'Invalid session' };
    }

    // Get member
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return { success: false, error: 'Invalid member' };
    }

    // Check if already checked in
    const existing = await prisma.attendance.findUnique({
      where: {
        sessionId_memberId: {
          sessionId: session.id,
          memberId: memberId,
        },
      },
    });

    if (existing) {
      return {
        success: true,
        duplicate: true,
        checkedAt: existing.checkedAt,
        memberName: member.name,
      };
    }

    // Get IP and User Agent
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        sessionId: session.id,
        memberId: memberId,
        ip,
        userAgent,
      },
    });

    return {
      success: true,
      duplicate: false,
      checkedAt: attendance.checkedAt,
      memberName: member.name,
    };
  } catch (error) {
    console.error('Check-in error:', error);
    return { success: false, error: 'Failed to check in' };
  }
}

export async function exportAttendanceCSV(sessionId: string) {
  try {
    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
      orderBy: { checkedAt: 'asc' },
    });

    // Get member details for each attendance
    const rows = await Promise.all(
      attendance.map(async (att) => {
        const member = await prisma.member.findUnique({
          where: { id: att.memberId },
        });
        return {
          name: member?.name || 'Unknown',
          group: member?.group || 'Unknown',
          checkedAt: att.checkedAt.toISOString(),
          ip: att.ip || '',
        };
      })
    );

    // Generate CSV
    const headers = ['Name', 'Group', 'Checked At', 'IP'];
    const csvRows = [
      headers.join(','),
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
