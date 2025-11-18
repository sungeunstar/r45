'use client';

import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import { Session } from '@/lib/supabase';

interface PublicCalendarProps {
  sessions: Session[];
  churchId: string;
}

export default function PublicCalendar({ sessions, churchId }: PublicCalendarProps) {
  const router = useRouter();

  return (
    <Calendar
      sessions={sessions}
      onSessionClick={(session) => {
        router.push(`/c/${churchId}/session/${session.id}`);
      }}
    />
  );
}
