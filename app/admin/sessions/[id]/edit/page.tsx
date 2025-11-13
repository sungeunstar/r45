'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSessionById, updateSession } from '@/lib/actions/sessions';
import { toDatetimeLocalString } from '@/lib/utils';

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
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
      setLoadingData(false);
    }
    loadSession();
  }, [sessionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await updateSession(sessionId, name, note, date);

    if (result.success) {
      router.push(`/admin/sessions/${sessionId}`);
      router.refresh();
    } else {
      setError(result.error || 'Failed to update session');
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto">
      <div className="mb-8 relative">
        <button
          onClick={() => router.back()}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-center text-white">Edit Session</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Session Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl text-white placeholder-white/40 transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="date" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Date & Time
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl text-white transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              colorScheme: 'dark',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="note" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Note (Optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="px-4 py-3 rounded-xl text-white placeholder-white/40 transition-all focus:outline-none resize-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          />
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'rgba(239,68,68,1)' }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-14 rounded-xl font-semibold text-base text-black transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
          }}
        >
          {loading ? 'Updating...' : 'Update Session'}
        </button>
      </form>
    </div>
  );
}
