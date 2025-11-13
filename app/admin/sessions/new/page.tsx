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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-[420px] mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-lg font-semibold text-white">세션 생성</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Session Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-white">
              세션 이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:border-white/40 transition-colors text-white placeholder-gray-400"
              placeholder="주일 1부 예배"
            />
          </div>

          {/* Date & Time */}
          <div className="flex flex-col gap-2">
            <label htmlFor="date" className="text-sm font-medium text-white">
              날짜와 시간
            </label>
            <input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-11 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:border-white/40 transition-colors text-white"
            />
          </div>

          {/* Member Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-white">
              맴버 선택 ({selectedMemberIds.length} / {members.length})
            </label>

            {/* Search */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름으로 검색"
              className="h-10 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors text-white placeholder-gray-500 text-sm"
            />

            {/* Global Select All */}
            <button
              type="button"
              onClick={handleSelectAll}
              className="h-11 px-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/10 transition-colors text-left flex items-center gap-2 text-white"
            >
              <span className="text-lg">
                {selectedMemberIds.length === members.length ? '☑' : '☐'}
              </span>
              <span className="font-medium">전체 선택</span>
            </button>

            {/* Groups */}
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {Object.entries(filteredGroupedMembers).map(([group, groupMembers]) => {
                const { selectedCount, totalCount, allSelected } = getGroupStats(group);
                const isExpanded = expandedGroups.includes(group);

                return (
                  <div
                    key={group}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group)}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        <span className="text-white/50">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        <span className="font-semibold text-white">{group}</span>
                        <span className="text-xs text-gray-400 ml-auto mr-2">
                          {selectedCount} / {totalCount}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectGroup(group)}
                        className="text-lg ml-2"
                      >
                        {allSelected ? '☑' : '☐'}
                      </button>
                    </div>

                    {/* Group Members */}
                    {isExpanded && (
                      <div className="p-2">
                        {groupMembers.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleToggleMember(member.id)}
                            className="w-full px-3 py-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"
                          >
                            <span className="text-lg">
                              {selectedMemberIds.includes(member.id) ? '☑' : '☐'}
                            </span>
                            <div className="flex-1 text-left">
                              <p className="text-white text-sm font-medium">{member.name}</p>
                              <p className="text-gray-400 text-xs">{member.phone}</p>
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
            <label htmlFor="note" className="text-sm font-medium text-white">
              예배 특이사항 메모 (선택)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:border-white/40 transition-colors resize-none text-white placeholder-gray-400"
              placeholder="예배 특이사항 메모"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-sm text-red-200 text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? '생성 중...' : '세션 생성'}
          </button>
        </form>
      </div>
    </div>
  );
}
