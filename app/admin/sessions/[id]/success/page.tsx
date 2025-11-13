'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSessionById } from '@/lib/actions/sessions';
import { useTheme } from '@/hooks/useTheme';

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
  const theme = useTheme();
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
      console.error('Failed to copy:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>로딩 중...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>세션을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-[420px] w-full py-12">
        {/* Success Icon */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>세션 생성 완료!</h1>
          <p className="text-sm" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
            세션이 성공적으로 생성되었습니다
          </p>
        </div>

        {/* Session Info Card */}
        <div
          className="rounded-[18px] p-6 mb-5"
          style={theme === 'dark' ? {
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
          } : {
            background: '#FFFFFF',
            border: '1px solid #e5e7eb',
          }}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>📌 세션 이름</p>
              <p className="text-lg font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>{session.name}</p>
            </div>

            <div>
              <p className="text-xs font-medium mb-1" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>📅 일시</p>
              <p className="text-base" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
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
                <p className="text-xs font-medium mb-1" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>📝 세션 내용</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{session.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Check-in Link Card */}
        <div
          className="rounded-[18px] p-6 mb-5"
          style={theme === 'dark' ? {
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
          } : {
            background: '#FFFFFF',
            border: '1px solid #e5e7eb',
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔗</span>
              <h2 className="text-lg font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>체크인 링크</h2>
            </div>

            <p className="text-xs mb-3" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              이 링크를 멤버들에게 공유하세요!
            </p>

            <div
              className="rounded-xl p-4"
              style={theme === 'dark' ? {
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
              } : {
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
              }}
            >
              <p className="text-sm font-mono break-all" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
                {checkInUrl}
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full h-12 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              style={theme === 'dark' ? {
                background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
                color: '#000000',
              } : {
                background: '#3b82f6',
                color: '#FFFFFF',
              }}
            >
              {copied ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/admin/sessions')}
            className="h-14 rounded-xl font-semibold transition-all"
            style={theme === 'dark' ? {
              background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
              color: '#000000',
            } : {
              background: '#3b82f6',
              color: '#FFFFFF',
            }}
          >
            세션 목록으로
          </button>
          <button
            onClick={() => router.push('/admin/sessions/new')}
            className="h-14 rounded-xl font-semibold transition-all"
            style={theme === 'dark' ? {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            } : {
              background: '#FFFFFF',
              border: '1px solid #e5e7eb',
              color: '#000000',
            }}
          >
            새 세션 만들기
          </button>
        </div>
      </div>
    </div>
  );
}
