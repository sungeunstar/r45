'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMemberById, updateMember, deleteMember } from '@/lib/actions/members';
import CustomSelect from '@/components/CustomSelect';

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('보컬');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const groupOptions = [
    { value: '보컬', label: '보컬', icon: '🎤' },
    { value: '악기', label: '악기', icon: '🎸' },
    { value: '음향', label: '음향', icon: '🎚️' },
  ];

  useEffect(() => {
    async function loadMember() {
      const member = await getMemberById(memberId);
      if (member) {
        setName(member.name);
        setPhone(member.phone);
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

    // Validate phone number format
    if (phone.includes('-')) {
      setError('전화번호에 하이픈(-)을 사용할 수 없습니다. 숫자만 입력해주세요.');
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      setError('전화번호는 11자리 숫자여야 합니다 (예: 01012345678)');
      return;
    }

    setLoading(true);

    const result = await updateMember(memberId, name, phone, group, isActive);

    if (result.success) {
      router.push('/admin/members');
      router.refresh();
    } else {
      setError(result.error || 'Failed to update member');
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`정말 ${name} 멤버를 삭제하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteMember(memberId);

    if (result.success) {
      router.push('/admin/members');
      router.refresh();
    } else {
      alert(result.error || '멤버 삭제에 실패했습니다');
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col max-w-[420px] mx-auto w-full px-5 py-6">
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
        <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>멤버 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1 pb-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            이름
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
            placeholder="홍길동"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            전화번호
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setPhone(value);
            }}
            required
            maxLength={11}
            className="h-[52px] px-4 rounded-xl transition-all focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#FFFFFF',
            }}
            placeholder="01012345678"
          />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            하이픈 없이 숫자만 11자리 입력해주세요
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="group" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            그룹
          </label>
          <CustomSelect
            value={group}
            onChange={setGroup}
            options={groupOptions}
            placeholder="그룹 선택"
          />
        </div>

        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: isActive ? '#FFFFFF' : 'transparent',
              border: isActive ? 'none' : '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {isActive && (
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5.5L5 9.5L13 1.5" stroke="#0B0B0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <label htmlFor="isActive" className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
            활성 멤버
          </label>
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: 'rgb(255, 95, 95)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'white' }}>{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-auto">
          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl font-semibold text-base transition-all disabled:opacity-40"
            style={{
              background: '#353C49',
              color: '#FFFFFF',
              padding: '16px 24px',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#2A303B';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#353C49';
            }}
          >
            {loading ? '수정 중...' : '멤버 수정'}
          </button>

          {/* Destructive Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full rounded-xl font-semibold text-base transition-all disabled:opacity-40"
            style={{
              background: '#FF5F5F',
              color: '#FFFFFF',
              padding: '16px 24px',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#E64B4B';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#FF5F5F';
            }}
          >
            멤버 삭제
          </button>
        </div>
      </form>
    </div>
  );
}
