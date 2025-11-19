import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth';
import { getAllSessions } from '@/lib/actions/sessions';
import CalendarWrapper from '@/components/CalendarWrapper';
import AdminNav from '@/components/AdminNav';

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const sessions = await getAllSessions();

  // 이번 주 일정 필터링
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const thisWeekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
  });

  // 다가오는 일정 (오늘 이후)
  const upcomingSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= today;
  }).slice(0, 5);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0B',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 네비게이션 (Flowing Chat + 교회이름 + 인사 + 탭) */}
        <AdminNav churchName={user.churchName} userName={user.userName} />

        {/* 새 일정 버튼 */}
        <div style={{ marginBottom: '24px', textAlign: 'right' }}>
          <Link
            href="/admin/sessions/new"
            style={{
              background: '#353C49',
              border: 'none',
              borderRadius: '11px',
              padding: '10px 16px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            + 새 일정
          </Link>
        </div>

        {/* 캘린더 */}
        <div style={{ marginBottom: '32px' }}>
          <CalendarWrapper sessions={sessions} />
        </div>

        {/* 이번 주 일정 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '18px',
            padding: '20px',
            marginBottom: '24px',
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
            이번 주 일정
          </h2>
          {thisWeekSessions.length === 0 ? (
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'center',
                padding: '20px 0',
              }}
            >
              이번 주 일정이 없습니다
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {thisWeekSessions.map(session => (
                <Link
                  key={session.id}
                  href={`/admin/sessions/${session.id}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '16px',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
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
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                        {session.start_time && ` ${session.start_time.slice(0, 5)}`}
                      </p>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      참석 {session.presentCount || 0}
                      {session.absentCount > 0 && ` / 불참 ${session.absentCount}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 다가오는 일정 */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '18px',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              다가오는 일정
            </h2>
            <Link
              href="/admin/sessions"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
              }}
            >
              전체 보기 &gt;
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingSessions.map(session => (
                <Link
                  key={session.id}
                  href={`/admin/sessions/${session.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    {session.title || session.name}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {new Date(session.date).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
