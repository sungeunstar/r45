'use client';

import { useState } from 'react';

type Step = 'phone' | 'status' | 'complete';
type Status = 'attend' | 'absent' | null;

export default function CheckInForm({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const [step, setStep] = useState<Step>('phone');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [status, setStatus] = useState<Status>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 핸드폰 번호 입력 (숫자만 4자리)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setPhoneLast4(value);
    }
  };

  // Step 1 → Step 2
  const handlePhoneSubmit = () => {
    if (phoneLast4.length === 4) {
      setStep('status');
      setError('');
    }
  };

  // 최종 제출
  const handleSubmit = async () => {
    if (!status) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          phoneLast4,
          status,
          reason: status === 'absent' ? reason : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStep('complete');
      } else {
        setError(result.error || '출석 체크에 실패했습니다');
      }
    } catch (error) {
      setError('출석 체크에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Step 1: 핸드폰 번호 입력 */}
      {step === 'phone' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              핸드폰 번호 뒷자리 4자리
            </label>
            <input
              id="phone"
              type="text"
              inputMode="numeric"
              value={phoneLast4}
              onChange={handlePhoneChange}
              placeholder="0000"
              maxLength={4}
              autoFocus
              className="h-[52px] px-4 text-center text-2xl font-semibold rounded-xl text-white placeholder-white/40 transition-all focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
              }}
            />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              핸드폰 번호 뒷자리 4자리를 입력해주세요
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
            onClick={handlePhoneSubmit}
            disabled={phoneLast4.length !== 4}
            className="h-14 rounded-xl font-semibold text-base text-black transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
            }}
          >
            계속하기
          </button>
        </div>
      )}

      {/* Step 2: 참석/불참 선택 */}
      {step === 'status' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              참석 여부
            </label>

            {/* 참석/불참 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setStatus('attend')}
                className="flex-1 h-14 rounded-xl font-semibold text-base transition-all"
                style={{
                  background: status === 'attend'
                    ? 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)'
                    : 'rgba(255,255,255,0.08)',
                  border: status === 'attend'
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.14)',
                  color: status === 'attend' ? '#000000' : '#FFFFFF',
                }}
              >
                참석
              </button>
              <button
                onClick={() => setStatus('absent')}
                className="flex-1 h-14 rounded-xl font-semibold text-base transition-all"
                style={{
                  background: status === 'absent'
                    ? 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)'
                    : 'rgba(255,255,255,0.08)',
                  border: status === 'absent'
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.14)',
                  color: status === 'absent' ? '#000000' : '#FFFFFF',
                }}
              >
                불참
              </button>
            </div>
          </div>

          {/* 불참 사유 입력 (슬라이드다운) */}
          {status === 'absent' && (
            <div className="flex flex-col gap-2">
              <label htmlFor="reason" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                불참 사유 (선택)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="불참 사유를 입력해주세요"
                rows={4}
                className="px-4 py-3 rounded-xl text-white placeholder-white/40 transition-all focus:outline-none resize-none"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              />
            </div>
          )}

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

          {/* 보내기 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!status || loading}
            className="h-14 rounded-xl font-semibold text-base text-black transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
            }}
          >
            {loading ? '처리 중...' : '보내기'}
          </button>

          {/* 뒤로가기 */}
          <button
            onClick={() => {
              setStep('phone');
              setStatus(null);
              setReason('');
              setError('');
            }}
            className="text-center text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            ← 뒤로가기
          </button>
        </div>
      )}

      {/* Step 3: 완료 화면 */}
      {step === 'complete' && (
        <div className="py-6">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {status === 'attend' ? '✅' : '📝'}
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
                {status === 'attend' ? '참석 완료!' : '불참 처리 완료'}
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {status === 'attend'
                  ? '출석이 정상적으로 기록되었습니다'
                  : '불참 사유가 전달되었습니다'}
              </p>
            </div>

            {status === 'absent' && reason && (
              <div className="pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  불참 사유
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {reason}
                </p>
              </div>
            )}
          </div>

          {/* 다른 사람 출석하기 버튼 */}
          <button
            onClick={() => {
              setStep('phone');
              setPhoneLast4('');
              setStatus(null);
              setReason('');
              setError('');
            }}
            className="w-full h-14 rounded-xl font-semibold transition-all text-white"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            다른 사람 출석하기
          </button>
        </div>
      )}
    </div>
  );
}
