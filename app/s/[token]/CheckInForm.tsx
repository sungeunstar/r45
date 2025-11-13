'use client';

import { useState } from 'react';
import { checkInAttendance } from '@/lib/actions/attendance';
import { formatDate } from '@/lib/utils';

type Member = {
  id: string;
  name: string;
  group: string;
};

export default function CheckInForm({
  sessionToken,
  members,
}: {
  sessionToken: string;
  members: Member[];
}) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedMemberId) {
      setError('Please select a member');
      return;
    }

    setError('');
    setLoading(true);

    const result = await checkInAttendance(sessionToken, selectedMemberId);

    if (result.success) {
      setSuccess(true);
      setDuplicate(result.duplicate || false);
      setCheckedAt(new Date(result.checkedAt));
      setMemberName(result.memberName);
    } else {
      setError(result.error || 'Check-in failed');
      setLoading(false);
    }
  }

  function handleReset() {
    setSuccess(false);
    setDuplicate(false);
    setSelectedMemberId('');
    setSearchTerm('');
    setError('');
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold mb-2">
          {duplicate ? '이미 출석 처리됨' : '출석 완료'}
        </h2>
        <p className="text-gray-600 mb-1">{memberName}</p>
        {checkedAt && (
          <p className="text-sm text-gray-500 mb-6">
            {formatDate(checkedAt)}
          </p>
        )}
        <button
          onClick={handleReset}
          className="h-11 px-6 border border-gray-200 rounded-lg font-medium hover:border-black transition-colors"
        >
          Check Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="search" className="text-sm font-medium">
          Search Member
        </label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
          placeholder="이름 또는 그룹 검색"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="member" className="text-sm font-medium">
          Select Member
        </label>
        <select
          id="member"
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          required
          className="h-11 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors bg-white"
        >
          <option value="">선택하세요</option>
          {filteredMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} — {member.group}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !selectedMemberId}
        className="h-12 bg-black text-white rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? '처리중...' : '출석하기'}
      </button>
    </form>
  );
}
