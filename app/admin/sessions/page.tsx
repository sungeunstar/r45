'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllSessions } from '@/lib/actions/sessions';
import { getAllMembers } from '@/lib/actions/members';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

type Session = {
  id: string;
  name: string;
  date: Date;
  note?: string;
  attendanceCount: number;
};

export default function SessionsPage() {
  const theme = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [sessionsData, membersData] = await Promise.all([
        getAllSessions(),
        getAllMembers()
      ]);
      setSessions(sessionsData);
      setTotalMembers(membersData.filter((m) => m.isActive).length);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
          Sessions
        </h2>
        <Link
          href="/admin/sessions/new"
          className="h-9 px-4 rounded-lg text-sm font-medium flex items-center transition-all"
          style={theme === 'dark' ? {
            background: '#FFFFFF',
            color: '#0b0b0b',
          } : {
            background: '#1A1E27',
            color: '#FFFFFF',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? '#f5f5f5' : '#151823';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? '#FFFFFF' : '#1A1E27';
          }}
        >
          Create Session
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{
          color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
        }}>
          <p>Loading...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4 text-5xl">📭</div>
          <h3 className="text-base font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
            생성된 세션이 없습니다
          </h3>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/admin/sessions/${session.id}`}
              className="rounded-lg px-5 py-4 transition-all"
              style={theme === 'dark' ? {
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              } : {
                background: '#FFFFFF',
                border: '1px solid #e5e7eb',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
                  {session.name}
                </h3>
                <span className="text-xs px-2 py-1 rounded-md" style={theme === 'dark' ? {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)'
                } : {
                  background: 'rgba(0,0,0,0.05)',
                  color: 'rgba(0,0,0,0.7)'
                }}>
                  {session.attendanceCount} / {totalMembers}
                </span>
              </div>
              <p className="text-sm mb-2" style={{
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
              }}>
                {formatDate(session.date)}
              </p>
              {session.note && (
                <p className="text-sm line-clamp-2" style={{
                  color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                }}>
                  {session.note}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
