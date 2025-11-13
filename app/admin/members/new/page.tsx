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
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-black transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold">Add Member</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            placeholder="홍길동"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium">
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
            className="h-11 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            placeholder="01012345678"
          />
          <p className="text-xs text-gray-500">
            하이픈 없이 숫자만 11자리 입력
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="group" className="text-sm font-medium">
            Group
          </label>
          <select
            id="group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            required
            className="h-11 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="보컬">보컬</option>
            <option value="악기">악기</option>
            <option value="음향">음향</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-11 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
}
