'use client';

import { useState } from 'react';
import { checkInAttendance } from '@/lib/actions/attendance';
import { formatDate } from '@/lib/utils';

export default function CheckInForm({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberGroup, setMemberGroup] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError('전화번호를 입력해주세요');
      return;
    }

    setError('');
    setLoading(true);

    const result = await checkInAttendance(sessionToken, phoneNumber);

    if (result.success) {
      setSuccess(true);
      setDuplicate(result.duplicate || false);
      setCheckedAt(result.checkedAt ? new Date(result.checkedAt) : null);
      setMemberName(result.memberName || '');
      setMemberGroup(result.memberGroup || '');
    } else {
      setError(result.error || '출석 체크 실패');
      setLoading(false);
    }
  }

  function handleReset() {
    setSuccess(false);
    setDuplicate(false);
    setPhoneNumber('');
    setError('');
    setLoading(false);
  }

  // Success State - Dark Glassmorphism Design
  if (success) {
    const groupEmoji = memberGroup === '보컬' ? '🎤' : memberGroup === '악기' ? '🎸' : memberGroup === '음향' ? '🎚️' : '👤';

    return (
      <div className="py-6">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {duplicate ? '✋' : '✅'}
          </div>
        </div>

        {/* Status Card */}
        <div
          className="rounded-[18px] p-6 mb-6"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold mb-2 text-white">
              {duplicate ? '이미 출석 처리됨' : '출석 완료!'}
            </h2>
            {duplicate && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                이미 출석 체크가 완료된 상태입니다
              </p>
            )}
          </div>

          <div className="space-y-4 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{groupEmoji}</span>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>이름</p>
                <p className="text-base font-bold text-white">{memberName}</p>
              </div>
            </div>

            {memberGroup && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>그룹</p>
                  <p className="text-base font-semibold text-white">{memberGroup}</p>
                </div>
              </div>
            )}

            {checkedAt && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>출석 시간</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {new Date(checkedAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleReset}
          className="w-full h-14 rounded-xl font-semibold transition-all text-white"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          다른 사람 출석하기
        </button>
      </div>
    );
  }

  // Form State - Dark Glassmorphism
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
          전화번호 입력
        </label>
        <input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setPhoneNumber(value);
          }}
          required
          autoFocus
          maxLength={11}
          className="h-[52px] px-4 rounded-xl text-white placeholder-white/40 transition-all focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
          placeholder="01012345678"
        />
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          하이픈 없이 숫자만 입력 (예: 01012345678)
        </p>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: 'rgb(255, 95, 95)',
          }}
        >
          <p className="text-sm text-center font-medium" style={{ color: 'white' }}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !phoneNumber.trim()}
        className="h-14 rounded-xl font-semibold text-base text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
        }}
      >
        {loading ? '처리중...' : '출석하기'}
      </button>
    </form>
  );
}
