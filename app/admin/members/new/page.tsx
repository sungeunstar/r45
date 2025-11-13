'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMember } from '@/lib/actions/members';
import { useTheme } from '@/hooks/useTheme';

export default function NewMemberPage() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('보컬');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate phone number format (no hyphens, numbers only, 11 digits)
    if (phone.includes('-')) {
      setError('전화번호에 하이픈(-)을 사용할 수 없습니다. 숫자만 입력해주세요.');
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      setError('전화번호는 11자리 숫자여야 합니다 (예: 01012345678)');
      return;
    }

    setLoading(true);

    const result = await createMember(name, phone, group);

    if (result.success) {
      router.push('/admin/members');
      router.refresh();
    } else {
      setError(result.error || 'Failed to create member');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col max-w-[420px] mx-auto w-full px-5">
      {/* Header */}
      <div className="mb-8 relative pt-6">
        <button
          onClick={() => router.back()}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-colors"
          style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-center" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>멤버 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1 pb-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            이름
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
              border: '1px solid #e5e7eb',
              color: '#000000',
            }}
            placeholder="홍길동"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            전화번호
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
              setPhone(value);
            }}
            required
            maxLength={11}
            className="h-[52px] px-4 rounded-xl transition-all focus:outline-none"
            style={theme === 'dark' ? {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            } : {
              background: '#FFFFFF',
              border: '1px solid #e5e7eb',
              color: '#000000',
            }}
            placeholder="01012345678"
          />
          <p className="text-xs" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            하이픈 없이 숫자만 11자리 입력해주세요
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="group" className="text-sm font-medium" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            그룹
          </label>
          <select
            id="group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl transition-all appearance-none cursor-pointer focus:outline-none"
            style={theme === 'dark' ? {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23fff' stroke-opacity='0.7' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '3rem',
            } : {
              background: '#FFFFFF',
              border: '1px solid #e5e7eb',
              color: '#000000',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23000' stroke-opacity='0.7' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '3rem',
            }}
          >
            <option value="보컬">🎤 보컬</option>
            <option value="악기">🎸 악기</option>
            <option value="음향">🎚️ 음향</option>
          </select>
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
          className="h-14 rounded-xl font-semibold text-base transition-all disabled:opacity-40 mt-auto"
          style={theme === 'dark' ? {
            background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
            color: '#000000',
          } : {
            background: '#3b82f6',
            color: '#FFFFFF',
          }}
        >
          {loading ? '등록 중...' : '멤버 등록'}
        </button>
      </form>
    </div>
  );
}
