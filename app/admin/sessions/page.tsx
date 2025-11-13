import Link from 'next/link';
import { getAllSessions } from '@/lib/actions/sessions';
import { getAllMembers } from '@/lib/actions/members';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
  const sessions = await getAllSessions();
  const allMembers = await getAllMembers();
  const totalMembers = allMembers.filter((m) => m.isActive).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Sessions</h2>
        <Link
          href="/admin/sessions/new"
          className="h-9 px-4 bg-black text-white rounded-lg text-sm font-medium flex items-center hover:bg-gray-800 transition-colors"
        >
          Create Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4 text-5xl">📭</div>
          <h3 className="text-base font-semibold text-gray-900">
            생성된 세션이 없습니다
          </h3>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/admin/sessions/${session.id}`}
              className="border border-gray-200 rounded-xl px-4 py-3 hover:border-black transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium">{session.name}</h3>
                <span className="text-xs text-gray-500">
                  {session.attendanceCount} / {totalMembers}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {formatDate(session.date)}
              </p>
              {session.note && (
                <p className="text-sm text-gray-500 line-clamp-2">
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
