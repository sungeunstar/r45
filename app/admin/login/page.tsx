'use client';

import { useState } from 'react';
import { loginAdmin } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginAdmin(email, password);

    if (result.success) {
      router.push('/admin/sessions');
      router.refresh();
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[420px]">
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <h1
            className="text-white"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.3px',
              color: '#FFFFFF',
              margin: 0,
              lineHeight: '1.3'
            }}
          >
            Joyful Church Admin
          </h1>
          <p
            style={{
              marginTop: '10px',
              fontSize: '15px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.55)',
              lineHeight: '1.5'
            }}
          >
            Joyful Church 예배팀 세션 관리 페이지입니다.
          </p>
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
              placeholder="admin@joyful.app"
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
              className="h-[52px] px-4 rounded-xl text-white placeholder-white/40 transition-all focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: 'rgb(255, 95, 95)',
              }}
            >
              <p className="text-sm text-center font-medium" style={{ color: 'white' }}>{error}</p>
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
