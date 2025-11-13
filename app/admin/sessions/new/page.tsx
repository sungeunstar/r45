'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['보컬', '악기', '음향']);
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

  // Group members by team
  const groupedMembers = useMemo(() => {
    const groups: Record<string, Member[]> = {
      '보컬': [],
      '악기': [],
      '음향': [],
    };

    members.forEach(member => {
      if (groups[member.group]) {
        groups[member.group].push(member);
      }
    });

    return groups;
  }, [members]);

  // Filter members by search term
  const filteredGroupedMembers = useMemo(() => {
    if (!searchTerm) return groupedMembers;

    const filtered: Record<string, Member[]> = {};
    Object.entries(groupedMembers).forEach(([group, groupMembers]) => {
      const matchedMembers = groupMembers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchedMembers.length > 0) {
        filtered[group] = matchedMembers;
      }
    });

    return filtered;
  }, [groupedMembers, searchTerm]);

  function toggleGroup(group: string) {
    setExpandedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  }

  function handleSelectAll() {
    if (selectedMemberIds.length === members.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(members.map(m => m.id));
    }
  }

  function handleSelectGroup(group: string) {
    const groupMemberIds = groupedMembers[group].map(m => m.id);
    const allSelected = groupMemberIds.every(id => selectedMemberIds.includes(id));

    if (allSelected) {
      setSelectedMemberIds(prev => prev.filter(id => !groupMemberIds.includes(id)));
    } else {
      setSelectedMemberIds(prev => [...new Set([...prev, ...groupMemberIds])]);
    }
  }

  function handleToggleMember(memberId: string) {
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== memberId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memberId]);
    }
  }

  function getGroupStats(group: string) {
    const groupMemberIds = groupedMembers[group].map(m => m.id);
    const selectedCount = groupMemberIds.filter(id => selectedMemberIds.includes(id)).length;
    const totalCount = groupMemberIds.length;
    return { selectedCount, totalCount, allSelected: selectedCount === totalCount };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (selectedMemberIds.length === 0) {
      setError('최소 1명 이상의 멤버를 선택해주세요');
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
        <h2 className="text-lg font-semibold">세션 생성</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Session Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            세션 이름
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

        {/* Date & Time */}
        <div className="flex flex-col gap-2">
          <label htmlFor="date" className="text-sm font-medium">
            날짜와 시간
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

        {/* Member Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">
            맴버 선택 ({selectedMemberIds.length} / {members.length})
          </label>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름으로 검색"
            className="h-10 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
          />

          {/* Global Select All */}
          <button
            type="button"
            onClick={handleSelectAll}
            className="h-11 px-4 border border-gray-200 rounded-lg hover:border-black transition-colors text-left flex items-center justify-between"
          >
            <span className="font-medium">전체 선택</span>
            <span className="text-xl">
              {selectedMemberIds.length === members.length ? '☑' : '☐'}
            </span>
          </button>

          {/* Groups - Scrollable Container */}
          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto border border-gray-100 rounded-xl p-2">
            {Object.entries(filteredGroupedMembers).map(([group, groupMembers]) => {
              const { selectedCount, totalCount, allSelected } = getGroupStats(group);
              const isExpanded = expandedGroups.includes(group);

              return (
                <div
                  key={group}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className="flex-1 flex items-center gap-2 text-left min-h-[44px]"
                    >
                      <span className="text-gray-400 text-sm">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                      <span className="font-semibold">{group}</span>
                      <span className="text-xs text-gray-500 ml-auto mr-3">
                        {selectedCount} / {totalCount}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectGroup(group)}
                      className="text-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      {allSelected ? '☑' : '☐'}
                    </button>
                  </div>

                  {/* Group Members */}
                  {isExpanded && (
                    <div className="bg-white">
                      {groupMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleToggleMember(member.id)}
                          className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-100 min-h-[56px]"
                        >
                          <span className="text-xl min-w-[24px]">
                            {selectedMemberIds.includes(member.id) ? '☑' : '☐'}
                          </span>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="flex flex-col gap-2">
          <label htmlFor="note" className="text-sm font-medium">
            예배 특이사항 메모 (선택)
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-12 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? '생성 중...' : '세션 생성'}
        </button>
      </form>
    </div>
  );
}
