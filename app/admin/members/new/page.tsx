'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMember } from '@/lib/actions/members';

export default function NewMemberPage() {
  const router = useRouter();
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
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-8 relative">
        <button
          onClick={() => router.back()}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black transition-colors"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-center">멤버 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col gap-3">
          <label htmlFor="name" className="text-sm font-semibold text-gray-900">
            이름
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all text-base"
            placeholder="홍길동"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="phone" className="text-sm font-semibold text-gray-900">
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
            className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all text-base"
            placeholder="01012345678"
          />
          <p className="text-xs text-gray-500">
            하이픈 없이 숫자만 11자리 입력해주세요
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="group" className="text-sm font-semibold text-gray-900">
            그룹
          </label>
          <select
            id="group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            required
            className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all bg-white text-base appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
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
          <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-14 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 text-base mt-auto"
        >
          {loading ? '등록 중...' : '멤버 등록'}
        </button>
      </form>
    </div>
  );
}
