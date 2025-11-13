'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/lib/actions/sessions';
import { getAllMembers } from '@/lib/actions/members';
import { toDatetimeLocalString } from '@/lib/utils';

type Member = {
  id: string;
  name: string;
  phone: string;
  group: string;
  isActive: boolean;
};

export default function NewSessionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toDatetimeLocalString(new Date()));
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      const data = await getAllMembers();
      const activeMembers = data.filter(m => m.isActive);
      setMembers(activeMembers);
      setLoadingMembers(false);
    }
    loadMembers();
  }, []);

  function handleSelectAll() {
    if (selectedMemberIds.length === members.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(members.map(m => m.id));
    }
  }

  function handleToggleMember(memberId: string) {
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== memberId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memberId]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (selectedMemberIds.length === 0) {
      setError('Please select at least one member');
      return;
    }

    setLoading(true);

    const result = await createSession(name, note, date, selectedMemberIds);

    if (result.success) {
      router.push('/admin/sessions');
      router.refresh();
    } else {
      setError(result.error || 'Failed to create session');
      setLoading(false);
    }
  }

  if (loadingMembers) {
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
        <h2 className="text-lg font-semibold">Create Session</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Session Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            placeholder="주일 1부 예배"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="date" className="text-sm font-medium">
            Date & Time
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-11 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Select Members ({selectedMemberIds.length} selected)
          </label>

          <button
            type="button"
            onClick={handleSelectAll}
            className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:border-black transition-colors text-left"
          >
            {selectedMemberIds.length === members.length ? '✓' : '☐'} Select All ({members.length})
          </button>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleToggleMember(member.id)}
                className="border border-gray-200 rounded-xl px-4 py-3 hover:border-black transition-colors text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {selectedMemberIds.includes(member.id) ? '☑' : '☐'}
                      </span>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.phone}</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {member.group}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="note" className="text-sm font-medium">
            Note (Optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
            placeholder="예배 특이사항 메모"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-11 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
}
