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
      const activeMembers = data.filter((m: Member) => m.isActive);
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

  const getGroupStats = useMemo(() => {
    const selectedSet = new Set(selectedMemberIds);
    return (group: string) => {
      const groupMemberIds = groupedMembers[group].map(m => m.id);
      const selectedCount = groupMemberIds.filter(id => selectedSet.has(id)).length;
      const totalCount = groupMemberIds.length;
      return { selectedCount, totalCount, allSelected: selectedCount === totalCount && totalCount > 0 };
    };
  }, [groupedMembers, selectedMemberIds]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (selectedMemberIds.length === 0) {
      setError('최소 1명 이상의 멤버를 선택해주세요');
      return;
    }

    setLoading(true);

    const result = await createSession(name, note, date, selectedMemberIds);

    if (result.success && result.sessionId) {
      router.push(`/admin/sessions/${result.sessionId}/success`);
      router.refresh();
    } else {
      setError(result.error || 'Failed to create session');
      setLoading(false);
    }
  }

  if (loadingMembers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>로딩 중...</p>
      </div>
    );
  }

  const groupEmoji: Record<string, string> = {
    '보컬': '🎤',
    '악기': '🎸',
    '음향': '🎚️',
  };

  return (
    <div className="min-h-screen py-6">
      {/* Header */}
      <div className="mb-8 relative flex items-center justify-center h-10">
        <button
          onClick={() => router.back()}
          className="absolute left-0 w-10 h-10 flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>세션 생성</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Session Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            세션 이름
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            }}
            placeholder="주일 1부 예배"
          />
        </div>

        {/* Date & Time */}
        <div className="flex flex-col gap-2">
          <label htmlFor="date" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            날짜와 시간
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-[52px] px-4 rounded-xl transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Member Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              멤버 선택
            </label>
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {selectedMemberIds.length} / {members.length}
            </span>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름으로 검색"
            className="h-11 px-4 rounded-xl text-sm transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#FFFFFF',
            }}
          />

          {/* Global Select All */}
          <button
            type="button"
            onClick={handleSelectAll}
            className="h-12 px-4 rounded-xl text-left flex items-center justify-between transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <span className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>전체 선택</span>
            <div className={`w-5 h-5 rounded flex items-center justify-center transition-all`}
              style={selectedMemberIds.length === members.length
                ? { background: '#FFFFFF', color: '#000000' }
                : { border: '1px solid rgba(255,255,255,0.3)' }
              }>
              {selectedMemberIds.length === members.length && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4 8L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>

          {/* Groups - Accordion */}
          <div className="flex flex-col gap-2">
            {Object.entries(filteredGroupedMembers).map(([group, groupMembers]) => {
              const { selectedCount, totalCount, allSelected } = getGroupStats(group);
              const isExpanded = expandedGroups.includes(group);

              return (
                <div
                  key={group}
                  className="rounded-[18px] overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {/* Group Header */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className="flex-1 flex items-center gap-2 text-left min-h-[44px]"
                    >
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                      <span className="text-lg">{groupEmoji[group]}</span>
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>{group}</span>
                      <span className="text-xs ml-auto mr-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {selectedCount} / {totalCount}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectGroup(group)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-all`}
                      style={allSelected
                        ? { background: '#FFFFFF', color: '#000000' }
                        : { border: '1px solid rgba(255,255,255,0.3)' }
                      }
                    >
                      {allSelected && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L4 8L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Group Members */}
                  {isExpanded && (
                    <div className="max-h-[40vh] overflow-y-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      {groupMembers.map((member) => {
                        const isSelected = selectedMemberIds.includes(member.id);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleToggleMember(member.id)}
                            className="w-full px-4 py-3 transition-colors flex items-center gap-3 min-h-[56px]"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all`}
                              style={isSelected
                                ? { background: '#FFFFFF', color: '#000000' }
                                : { border: '1px solid rgba(255,255,255,0.3)' }
                              }>
                              {isSelected && (
                                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 5L4 8L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{member.name}</p>
                              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{member.phone}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="flex flex-col gap-2">
          <label htmlFor="note" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            세션 내용 (선택)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="px-4 py-3 rounded-xl resize-none transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            }}
            placeholder="세션 내용을 입력하세요"
          />
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgb(255, 95, 95)' }}>
            <p className="text-sm text-center font-medium" style={{ color: 'white' }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl font-semibold text-base transition-all disabled:opacity-40 hover:enabled:bg-[#2A303B]"
          style={{
            background: '#353C49',
            color: '#FFFFFF',
            padding: '16px 24px',
            border: 'none',
          }}
        >
          {loading ? '생성 중...' : '세션 생성'}
        </button>
      </form>
    </div>
  );
}
