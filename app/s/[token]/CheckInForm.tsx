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
      setCheckedAt(new Date(result.checkedAt));
      setMemberName(result.memberName);
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

  // Success State - Markdown-style Design
  if (success) {
    const groupEmoji = memberGroup === '보컬' ? '🎤' : memberGroup === '악기' ? '🎸' : memberGroup === '음향' ? '🎚️' : '👤';

    return (
      <div className="py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16L14 22L24 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white/70 border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">
              {duplicate ? '✋ 이미 출석 처리됨' : '✅ 출석 완료!'}
            </h2>
            {duplicate && (
              <p className="text-sm text-gray-600">
                이미 출석 체크가 완료된 상태입니다
              </p>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{groupEmoji}</span>
              <div>
                <p className="text-xs font-semibold text-gray-500">이름</p>
                <p className="text-base font-bold">{memberName}</p>
              </div>
            </div>

            {memberGroup && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500">그룹</p>
                  <p className="text-base font-semibold">{memberGroup}</p>
                </div>
              </div>
            )}

            {checkedAt && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500">출석 시간</p>
                  <p className="text-sm text-gray-700">
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
          className="w-full h-12 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          다른 사람 출석하기
        </button>
      </div>
    );
  }

  // Form State - New Style Guide
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-sm font-semibold text-gray-900">
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
          className="h-12 px-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all text-base"
          placeholder="01012345678"
          style={{
            borderWidth: phoneNumber ? '1.5px' : '1px',
          }}
        />
        <p className="text-xs text-gray-500">
          하이픈 없이 숫자만 입력 (예: 01012345678)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600 text-center font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !phoneNumber.trim()}
        className="h-12 bg-black text-white rounded-xl font-semibold text-base hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? '처리중...' : '출석하기'}
      </button>
    </form>
  );
}
