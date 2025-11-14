import Link from 'next/link';
import { getAllSessions } from '@/lib/actions/sessions';
import { getAllMembers } from '@/lib/actions/members';
import { formatDate } from '@/lib/utils';

type Session = {
  id: string;
  name: string;
  date: Date;
  note: string | null;
  attendanceCount: number;
};

export default async function SessionsPage() {
  const [sessionsData, membersData] = await Promise.all([
    getAllSessions(),
    getAllMembers()
  ]);

  const sessions = sessionsData;
  const totalMembers = membersData.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
          세션
        </h2>
        <Link
          href="/admin/sessions/new"
          className="h-9 px-4 rounded-lg text-sm font-medium flex items-center transition-all hover:bg-[#f5f5f5]"
          style={{
            background: '#FFFFFF',
            color: '#0b0b0b',
          }}
        >
          세션 생성
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4 text-5xl">📭</div>
          <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
            생성된 세션이 없습니다
          </h3>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/admin/sessions/${session.id}`}
              className="rounded-lg px-5 py-4 transition-all hover:bg-[rgba(255,255,255,0.08)]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>
                  {session.name}
                </h3>
                <span className="text-xs px-2 py-1 rounded-md" style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  {session.attendanceCount} / {totalMembers}
                </span>
              </div>
              <p className="text-sm mb-2" style={{
                color: 'rgba(255,255,255,0.6)'
              }}>
                {formatDate(session.date)}
              </p>
              {session.note && (
                <p className="text-sm line-clamp-2" style={{
                  color: 'rgba(255,255,255,0.5)'
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
