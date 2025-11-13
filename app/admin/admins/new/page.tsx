'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminUser } from '@/lib/actions/admin-users';

export default function NewAdminPage() {
  const router = useRouter();
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
        <h1 className="text-xl font-bold text-center text-white">Add Admin</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl text-white placeholder-white/40 transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
            placeholder="user@joyful.app"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-[52px] px-4 rounded-xl text-white placeholder-white/40 transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
            placeholder="Min. 6 characters"
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
          {loading ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
}
