'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSessionById } from '@/lib/actions/sessions';

type Session = {
  id: string;
  name: string;
  note: string | null;
  date: Date;
  publicToken: string;
};

export default function SessionSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const data = await getSessionById(sessionId);
      if (data) {
        setSession(data);
      }
      setLoading(false);
    }
    loadSession();
  }, [sessionId]);

  const checkInUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${session?.publicToken}`
    : '';

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Copy failed silently
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>로딩 중...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>세션을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-5"
      style={{
        background: '#0B0B0B',
      }}
    >
      <div className="max-w-[420px] mx-auto py-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="text-[52px] mb-2">🎉</div>
          <h1 className="text-2xl font-bold mb-1.5" style={{ color: '#FFFFFF' }}>세션 생성 완료!</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            세션이 성공적으로 생성되었습니다
          </p>
        </div>

        {/* Session Info Card */}
        <div
          className="rounded-2xl mb-4"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>📌 세션 이름</p>
              <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{session.name}</p>
            </div>

            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>📅 일시</p>
              <p className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                {new Date(session.date).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {session.note && (
              <div>
                <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>📝 세션 내용</p>
                <p className="text-sm font-medium whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>{session.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Check-in Link Card */}
        <div
          className="rounded-2xl mb-4"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔗</span>
              <h2 className="text-base font-bold" style={{ color: '#FFFFFF' }}>체크인 링크</h2>
            </div>

            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              이 링크를 멤버들에게 공유하세요!
            </p>

            <div
              className="rounded-lg p-3.5"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
              }}
            >
              <p className="text-xs font-mono break-all" style={{ color: '#FFFFFF', lineHeight: '1.5' }}>
                {checkInUrl}
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              className="h-11 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
                color: '#000000',
              }}
            >
              {copied ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 13V5C3 3.89543 3.89543 3 5 3H13" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <span>링크 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
          <button
            onClick={() => router.push('/admin/sessions')}
            className="h-14 rounded-xl font-semibold transition-all"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
              color: '#000000',
            }}
          >
            세션 목록으로
          </button>
          <button
            onClick={() => router.push('/admin/sessions/new')}
            className="h-14 rounded-xl font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            }}
          >
            새 세션 만들기
          </button>
        </div>
      </div>
    </div>
  );
}
