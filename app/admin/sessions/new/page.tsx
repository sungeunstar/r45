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

type GroupTab = '전체' | '보컬' | '악기' | '음향';

export default function NewSessionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toDatetimeLocalString(new Date()));
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<GroupTab>('전체');
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

  // Filter members based on active tab and search term
  const displayedMembers = useMemo(() => {
    let filtered = members;

    // Filter by group tab
    if (activeTab !== '전체') {
      filtered = filtered.filter(m => m.group === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [members, activeTab, searchTerm]);

  function handleSelectAll() {
    const currentTabMemberIds = displayedMembers.map(m => m.id);
    const allCurrentSelected = currentTabMemberIds.every(id => selectedMemberIds.includes(id));

    if (allCurrentSelected) {
      // Deselect all from current tab
      setSelectedMemberIds(prev => prev.filter(id => !currentTabMemberIds.includes(id)));
    } else {
      // Select all from current tab
      setSelectedMemberIds(prev => [...new Set([...prev, ...currentTabMemberIds])]);
    }
  }

  function handleToggleMember(memberId: string) {
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== memberId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memberId]);
    }
  }

  const isAllCurrentSelected = displayedMembers.length > 0 && displayedMembers.every(m => selectedMemberIds.includes(m.id));

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
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-4 text-sm"
        >
          <span>←</span>
          <span>돌아가기</span>
        </button>
        <h1 className="text-2xl font-bold">세션 생성</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
        {/* Session Name */}
        <div className="flex flex-col gap-3">
          <label htmlFor="name" className="text-sm font-semibold text-gray-900">
            세션 이름
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all text-base"
            placeholder="주일 1부 예배"
          />
        </div>

        {/* Date & Time */}
        <div className="flex flex-col gap-3">
          <label htmlFor="date" className="text-sm font-semibold text-gray-900">
            날짜와 시간
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all text-base"
          />
        </div>

        {/* Member Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">
              멤버 선택
            </label>
            <span className="text-sm font-medium text-gray-600">
              {selectedMemberIds.length} / {members.length}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b-2 border-gray-200">
            {(['전체', '보컬', '악기', '음향'] as GroupTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-semibold text-sm transition-all relative ${
                  activeTab === tab
                    ? 'text-black'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름으로 검색"
            className="h-11 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all text-sm"
          />

          {/* Select All Button */}
          <button
            type="button"
            onClick={handleSelectAll}
            className="h-12 px-4 border-2 border-gray-200 rounded-xl hover:border-black transition-all text-left flex items-center justify-between"
          >
            <span className="font-semibold text-sm">
              {activeTab === '전체' ? '전체 선택' : `${activeTab} 전체 선택`}
            </span>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
              isAllCurrentSelected
                ? 'bg-black text-white'
                : 'border-2 border-gray-300'
            }`}>
              {isAllCurrentSelected && (
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>

          {/* Member List - Scrollable */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="max-h-[50vh] overflow-y-auto">
              {displayedMembers.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  멤버가 없습니다
                </div>
              ) : (
                displayedMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleToggleMember(member.id)}
                      className="w-full px-4 py-4 hover:bg-gray-50 transition-colors flex items-center gap-4 border-b border-gray-100 last:border-b-0 min-h-[64px]"
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'border-2 border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{member.phone}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="flex flex-col gap-3">
          <label htmlFor="note" className="text-sm font-semibold text-gray-900">
            예배 특이사항 메모 (선택)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all resize-none text-base"
            placeholder="예배 특이사항을 입력하세요"
          />
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-14 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 text-base mt-auto"
        >
          {loading ? '생성 중...' : '세션 생성'}
        </button>
      </form>
    </div>
  );
}
