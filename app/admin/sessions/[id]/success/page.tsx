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
      console.error('Failed to copy:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">세션을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-[420px] w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-full mb-4">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 20L16 28L32 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">✨ 세션 생성 완료!</h1>
          <p className="text-gray-600 text-sm">
            세션이 성공적으로 생성되었습니다
          </p>
        </div>

        {/* Session Info Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">📌 세션 이름</p>
              <p className="text-lg font-bold">{session.name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">📅 일시</p>
              <p className="text-base">
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
                <p className="text-xs font-semibold text-gray-500 mb-1">📝 세션 내용</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Check-in Link Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-4 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔗</span>
              <h2 className="text-lg font-bold text-white">체크인 링크</h2>
            </div>

            <p className="text-xs text-gray-300 mb-3">
              이 링크를 멤버들에게 공유하세요!
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-white font-mono break-all">
                {checkInUrl}
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full h-12 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
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
            className="h-12 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            세션 목록으로
          </button>
          <button
            onClick={() => router.push('/admin/sessions/new')}
            className="h-12 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-black hover:text-black transition-all"
          >
            새 세션 만들기
          </button>
        </div>
      </div>
    </div>
  );
}
