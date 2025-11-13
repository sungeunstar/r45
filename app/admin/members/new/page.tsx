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
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="h-11 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            placeholder="010-1234-5678"
          />
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
