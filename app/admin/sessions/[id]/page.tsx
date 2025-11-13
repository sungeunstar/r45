import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getSessionById,
  getSessionAttendance,
  getAbsentMembers,
  deleteSession,
} from '@/lib/actions/sessions';
import { formatDate } from '@/lib/utils';
import DeleteButton from './DeleteButton';
import CopyLinkButton from './CopyLinkButton';
import ExportCSVButton from './ExportCSVButton';

export const dynamic = 'force-dynamic';

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionById(params.id);

  if (!session) {
    notFound();
  }

  const attendance = await getSessionAttendance(params.id);
  const absentMembers = await getAbsentMembers(params.id);

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/s/${session.publicToken}`;

  const groupEmojis: { [key: string]: string } = {
    '보컬': '🎤',
    '악기': '🎸',
    '음향': '🎚️'
  };

  return (
    <div className="max-w-[420px] mx-auto">
      <div className="mb-8 relative">
        <Link
          href="/admin/sessions"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-center text-white">Session Detail</h1>
      </div>

      <div
        className="rounded-[18px] px-5 py-5 mb-6"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <h3 className="font-bold text-lg mb-2 text-white">{session.name}</h3>
        <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{formatDate(session.date)}</p>
        {session.note && (
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.7)' }}>{session.note}</p>
        )}

        <div className="flex flex-col gap-2">
          <CopyLinkButton url={publicUrl} />
          <ExportCSVButton sessionId={params.id} />
          <Link
            href={`/admin/sessions/${params.id}/edit`}
            className="h-11 px-4 rounded-xl text-sm font-semibold flex items-center justify-center transition-all text-white"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            Edit Session
          </Link>
          <DeleteButton sessionId={params.id} sessionName={session.name} />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-white">
          Attended ({attendance.length})
        </h3>
        {attendance.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>No attendance yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {attendance.map((att) => {
              const emoji = groupEmojis[att.memberGroup] || '👤';
              return (
                <div
                  key={att.id}
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{emoji}</span>
                      <div>
                        <span className="font-semibold text-white">{att.memberName}</span>
                        <span className="text-sm ml-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {att.memberGroup}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {formatDate(att.checkedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">
          Absent ({absentMembers.length})
        </h3>
        {absentMembers.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Everyone attended!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {absentMembers.map((member) => {
              const emoji = groupEmojis[member.group] || '👤';
              return (
                <div
                  key={member.id}
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <span className="font-semibold text-white">{member.name}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {member.group}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
