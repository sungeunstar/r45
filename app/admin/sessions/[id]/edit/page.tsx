'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSessionById, updateSession, getSessionMembers } from '@/lib/actions/sessions';
import { toDatetimeLocalString } from '@/lib/utils';

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const session = await getSessionById(sessionId);
      if (session) {
        setName(session.name);
        setNote(session.note || '');
        setDate(toDatetimeLocalString(session.date));
      }

      const members = await getSessionMembers(sessionId);
      setMemberIds(members.map(m => m.id));

      setLoadingData(false);
    }
    loadSession();
  }, [sessionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await updateSession(sessionId, name, note, date, memberIds);

    if (result.success) {
      router.push(`/admin/sessions/${sessionId}`);
      router.refresh();
    } else {
      setError(result.error || '세션 수정에 실패했습니다');
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto px-5 py-6">
      <div className="mb-8 relative flex items-center justify-center h-10">
        <button
          onClick={() => router.back()}
          className="absolute left-0 w-10 h-10 flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>세션 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            세션 이름
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="date" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            날짜 및 시간
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              colorScheme: 'dark',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="note" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            메모 (선택사항)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="px-4 py-3 rounded-xl transition-all focus:outline-none resize-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            }}
          />
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: 'rgb(255, 95, 95)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'white' }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl font-semibold text-base transition-all disabled:opacity-40"
          style={{
            background: '#353C49',
            color: '#FFFFFF',
            padding: '16px 24px',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2A303B';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#353C49';
          }}
        >
          {loading ? '수정 중...' : '세션 수정'}
        </button>
      </form>
    </div>
  );
}
