'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSessionById, updateSession, getSessionMembers } from '@/lib/actions/sessions';
import { toDatetimeLocalString } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
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
      setError(result.error || 'Failed to update session');
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <p style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto px-5 py-6">
      <div className="mb-8 relative flex items-center justify-center h-10">
        <button
          onClick={() => router.back()}
          className="absolute left-0 w-10 h-10 flex items-center justify-center transition-colors"
          style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>Edit Session</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            Session Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl transition-all focus:outline-none"
            style={theme === 'dark' ? {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            } : {
              background: '#FFFFFF',
              border: '1px solid #D4D7DF',
              color: '#1A1E27',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="date" className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            Date & Time
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl transition-all focus:outline-none"
            style={theme === 'dark' ? {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              colorScheme: 'dark',
            } : {
              background: '#FFFFFF',
              border: '1px solid #D4D7DF',
              color: '#1A1E27',
              colorScheme: 'light',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="note" className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            Note (Optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="px-4 py-3 rounded-xl transition-all focus:outline-none resize-none"
            style={theme === 'dark' ? {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            } : {
              background: '#FFFFFF',
              border: '1px solid #D4D7DF',
              color: '#1A1E27',
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
          className="w-full rounded-xl font-semibold text-base transition-all disabled:opacity-40"
          style={theme === 'dark' ? {
            background: '#353C49',
            color: '#FFFFFF',
            padding: '16px 24px',
            border: 'none',
          } : {
            background: '#1A1E27',
            color: '#FFFFFF',
            padding: '16px 24px',
            border: 'none',
            boxShadow: '0 8px 20px rgba(26, 30, 39, 0.18)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? '#2A303B' : '#151823';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? '#353C49' : '#1A1E27';
          }}
        >
          {loading ? 'Updating...' : 'Update Session'}
        </button>
      </form>
    </div>
  );
}
