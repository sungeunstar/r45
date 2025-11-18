'use client';

import { useRouter } from 'next/navigation';
import Calendar from './Calendar';
import { Session } from '@/lib/supabase';

interface CalendarWrapperProps {
  sessions: (Session & { attendanceCount?: number; presentCount?: number; absentCount?: number })[];
}

export default function CalendarWrapper({ sessions }: CalendarWrapperProps) {
  const router = useRouter();

  return (
    <Calendar
      sessions={sessions}
      onSessionClick={(session) => {
        router.push(`/admin/sessions/${session.id}`);
      }}
      onDateClick={(date) => {
        const dateStr = date.toISOString().split('T')[0];
        router.push(`/admin/sessions/new?date=${dateStr}`);
      }}
    />
  );
}
