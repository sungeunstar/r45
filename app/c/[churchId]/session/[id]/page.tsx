import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getChurchById } from '@/lib/actions/auth';
import { getPublicSessionById } from '@/lib/actions/sessions';
import AttendanceForm from './AttendanceForm';

interface PageProps {
  params: Promise<{ churchId: string; id: string }>;
}

export default async function PublicSessionPage({ params }: PageProps) {
  const { churchId, id: sessionId } = await params;

  const [church, session] = await Promise.all([
    getChurchById(churchId),
    getPublicSessionById(sessionId),
  ]);

  if (!church || !session) {
    notFound();
  }

  // 세션이 해당 교회의 것인지 확인
  if (session.church_id !== churchId) {
    notFound();
  }

  const sessionDate = new Date(session.date);
  const isToday = new Date().toDateString() === sessionDate.toDateString();
  const isPast = sessionDate < new Date();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0B',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        {/* 뒤로가기 */}
        <Link
          href={`/c/${churchId}/calendar`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: '20px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          캘린더로 돌아가기
        </Link>

        {/* 교회 이름 */}
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: '0 0 8px',
          }}
        >
          {church.name}
        </p>

        {/* 일정 정보 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '18px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              margin: '0 0 16px',
            }}
          >
            {session.title || session.name}
          </h1>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* 날짜 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  background: isToday ? 'rgba(100, 150, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  {sessionDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
                {isToday && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'rgba(100, 150, 255, 0.9)',
                      fontWeight: '500',
                    }}
                  >
                    오늘
                  </span>
                )}
              </div>
            </div>

            {/* 시간 */}
            {session.start_time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  {session.start_time.slice(0, 5)}
                  {session.end_time && ` - ${session.end_time.slice(0, 5)}`}
                </p>
              </div>
            )}
          </div>

          {/* 설명 */}
          {(session.description || session.note) && (
            <div
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0,
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {session.description || session.note}
              </p>
            </div>
          )}
        </div>

        {/* 출석 체크 폼 */}
        {session.has_attendance && (
          <AttendanceForm sessionId={sessionId} isPast={isPast && !isToday} />
        )}

        {/* 출석 체크 비활성화 메시지 */}
        {!session.has_attendance && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '18px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
              }}
            >
              이 일정은 출석 체크가 활성화되어 있지 않습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
