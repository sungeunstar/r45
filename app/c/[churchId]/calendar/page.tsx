import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getChurchById } from '@/lib/actions/auth';
import { getSessionsByChurchId } from '@/lib/actions/sessions';
import PublicCalendar from './PublicCalendar';

interface PageProps {
  params: Promise<{ churchId: string }>;
}

export default async function PublicChurchCalendar({ params }: PageProps) {
  const { churchId } = await params;

  const church = await getChurchById(churchId);
  if (!church) {
    notFound();
  }

  const sessions = await getSessionsByChurchId(churchId);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0B',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              margin: '0 0 8px',
            }}
          >
            {church.name}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: 0,
            }}
          >
            일정 캘린더
          </p>
        </div>

        {/* 캘린더 */}
        <PublicCalendar sessions={sessions} churchId={churchId} />

        {/* 다가오는 일정 목록 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '18px',
            padding: '20px',
            marginTop: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: '16px',
            }}
          >
            다가오는 일정
          </h2>
          {sessions.filter(s => new Date(s.date) >= new Date()).length === 0 ? (
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'center',
                padding: '20px 0',
              }}
            >
              예정된 일정이 없습니다
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions
                .filter(s => new Date(s.date) >= new Date())
                .slice(0, 10)
                .map(session => (
                  <Link
                    key={session.id}
                    href={`/c/${churchId}/session/${session.id}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '16px',
                      textDecoration: 'none',
                      display: 'block',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#FFFFFF',
                          margin: '0 0 4px',
                        }}
                      >
                        {session.title || session.name}
                      </h3>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          margin: 0,
                        }}
                      >
                        {new Date(session.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                        {session.start_time && ` ${session.start_time.slice(0, 5)}`}
                      </p>
                      {session.description && (
                        <p
                          style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            margin: '8px 0 0',
                          }}
                        >
                          {session.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
