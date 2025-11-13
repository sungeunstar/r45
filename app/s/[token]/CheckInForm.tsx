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

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold mb-2">
          {duplicate ? '이미 출석 처리됨' : '출석 완료'}
        </h2>
        <p className="text-gray-600 mb-1">{memberName}</p>
        {memberGroup && (
          <p className="text-sm text-gray-500 mb-2">{memberGroup}</p>
        )}
        {checkedAt && (
          <p className="text-sm text-gray-500 mb-6">
            {formatDate(checkedAt)}
          </p>
        )}
        <button
          onClick={handleReset}
          className="h-11 px-6 border border-gray-200 rounded-lg font-medium hover:border-black transition-colors"
        >
          다른 사람 출석하기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-sm font-medium">
          전화번호 입력
        </label>
        <input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          autoFocus
          className="h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors text-lg"
          placeholder="010-1234-5678"
        />
        <p className="text-xs text-gray-500">
          등록된 전화번호를 입력해주세요
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !phoneNumber.trim()}
        className="h-12 bg-black text-white rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '처리중...' : '출석하기'}
      </button>
    </form>
  );
}
