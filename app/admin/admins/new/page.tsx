'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminUser } from '@/lib/actions/admin-users';
import { useTheme } from '@/hooks/useTheme';

export default function NewAdminPage() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await createAdminUser(email, password);

    if (result.success) {
      router.push('/admin/admins');
      router.refresh();
    } else {
      setError(result.error || 'Failed to create admin');
      setLoading(false);
    }
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
        <h1 className="text-xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>Add Admin</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="user@joyful.app"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
            placeholder="Min. 6 characters"
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
          {loading ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
}
