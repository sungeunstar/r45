'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMemberById, updateMember, deleteMember } from '@/lib/actions/members';

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [name, setName] = useState('');
  const [group, setGroup] = useState('보컬');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadMember() {
      const member = await getMemberById(memberId);
      if (member) {
        setName(member.name);
        setGroup(member.group);
        setIsActive(member.isActive);
      }
      setLoadingData(false);
    }
    loadMember();
  }, [memberId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await updateMember(memberId, name, group, isActive);

    if (result.success) {
      router.push('/admin/members');
      router.refresh();
    } else {
      setError(result.error || 'Failed to update member');
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteMember(memberId);

    if (result.success) {
      router.push('/admin/members');
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete member');
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
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
        <h2 className="text-lg font-semibold">Edit Member</h2>
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

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active Member
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-11 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Member'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="h-11 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Delete Member
        </button>
      </form>
    </div>
  );
}
