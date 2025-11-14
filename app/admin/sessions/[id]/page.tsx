import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  getSessionById,
  getSessionAttendance,
  getAbsentMembers,
} from '@/lib/actions/sessions';
import { formatDate } from '@/lib/utils';
import DeleteButton from './DeleteButton';
import CopyLinkButton from './CopyLinkButton';
import ExportCSVButton from './ExportCSVButton';

type Session = {
  id: string;
  name: string;
  date: Date;
  note: string | null;
  public_token: string;
};

type Attendance = {
  id: string;
  memberName: string;
  memberGroup: string;
  checkedAt: Date;
  status: string;
  reason?: string | null;
  phone_last4: string;
};

type Member = {
  id: string;
  name: string;
  group: string;
};

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [session, attendance, absentMembers] = await Promise.all([
    getSessionById(params.id),
    getSessionAttendance(params.id),
    getAbsentMembers(params.id),
  ]);

  if (!session) {
    redirect('/admin/sessions');
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/s/${session.public_token}`;

  const groupEmojis: { [key: string]: string } = {
    '보컬': '🎤',
    '악기': '🎸',
    '음향': '🎚️'
  };

  // 참석/불참 구분
  const attendedList = attendance.filter(att => att.status === 'attend');
  const absentList = attendance.filter(att => att.status === 'absent');

  return (
    <div className="max-w-[420px] mx-auto">
      <div className="mb-8 relative">
        <Link
          href="/admin/sessions"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-center" style={{ color: '#FFFFFF' }}>Session Detail</h1>
      </div>

      <div
        className="rounded-[18px] px-5 py-5 mb-6"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <h3 className="font-bold text-lg mb-2" style={{ color: '#FFFFFF' }}>{session.name}</h3>
        <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{formatDate(session.date)}</p>
        {session.note && (
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.7)' }}>{session.note}</p>
        )}

        <div className="flex flex-col gap-2">
          <CopyLinkButton url={publicUrl} />
          <ExportCSVButton sessionId={params.id} />
          <Link
            href={`/admin/sessions/${params.id}/edit`}
            className="h-11 px-4 rounded-xl text-sm font-semibold flex items-center justify-center transition-all"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            }}
          >
            Edit Session
          </Link>
          <DeleteButton sessionId={params.id} sessionName={session.name} />
        </div>
      </div>

      {/* 참석자 목록 */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3" style={{ color: '#FFFFFF' }}>
          참석 ({attendedList.length})
        </h3>
        {attendedList.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>참석자가 없습니다</p>
        ) : (
          <div className="flex flex-col gap-2">
            {attendedList.map((att) => {
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
                        <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                          {att.memberName}
                        </span>
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

      {/* 불참자 목록 (출석 체크한 불참) */}
      {absentList.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3" style={{ color: '#FFFFFF' }}>
            불참 ({absentList.length})
          </h3>
          <div className="flex flex-col gap-2">
            {absentList.map((att) => {
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{emoji}</span>
                    <div className="flex-1">
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                        {att.memberName}
                      </span>
                      <span className="text-sm ml-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {att.memberGroup}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {formatDate(att.checkedAt)}
                    </span>
                  </div>
                  {att.reason && (
                    <div className="pl-9">
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        사유: {att.reason}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 미응답 목록 (SessionMember에 있지만 출석 체크 안한 사람) */}
      <div>
        <h3 className="font-semibold mb-3" style={{ color: '#FFFFFF' }}>
          미응답 ({absentMembers.length})
        </h3>
        {absentMembers.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>모두 응답했습니다!</p>
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
                    <span className="font-semibold" style={{ color: '#FFFFFF' }}>{member.name}</span>
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
