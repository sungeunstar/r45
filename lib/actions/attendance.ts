'use server';

import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function checkInAttendance(publicToken: string, phoneNumber: string) {
  try {
    // Get session by token
    const session = await prisma.session.findUnique({
      where: { publicToken },
    });

    if (!session) {
      return { success: false, error: '세션을 찾을 수 없습니다' };
    }

    // Find member by phone number
    const member = await prisma.member.findFirst({
      where: { phone: phoneNumber, isActive: true },
    });

    if (!member) {
      return { success: false, error: '등록되지 않은 전화번호입니다' };
    }

    // Check if member is invited to this session
    const invited = await prisma.sessionMember.findUnique({
      where: {
        sessionId_memberId: {
          sessionId: session.id,
          memberId: member.id,
        },
      },
    });

    if (!invited) {
      return { success: false, error: '이 세션에 초대되지 않은 멤버입니다' };
    }

    // Check if already checked in
    const existing = await prisma.attendance.findUnique({
      where: {
        sessionId_memberId: {
          sessionId: session.id,
          memberId: member.id,
        },
      },
    });

    if (existing) {
      return {
        success: true,
        duplicate: true,
        checkedAt: existing.checkedAt,
        memberName: member.name,
        memberGroup: member.group,
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
        memberId: member.id,
        ip,
        userAgent,
      },
    });

    return {
      success: true,
      duplicate: false,
      checkedAt: attendance.checkedAt,
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
