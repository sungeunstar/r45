'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitAttendance, getSessionInfo } from '@/lib/actions/checkin';

type Step = 'phone' | 'status' | 'complete';
type Status = 'attend' | 'absent' | null;

export default function CheckInContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [step, setStep] = useState<Step>('phone');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [status, setStatus] = useState<Status>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionName, setSessionName] = useState('');

  useEffect(() => {
    if (sessionId) {
      getSessionInfo(sessionId).then((res) => {
        if (res.success && res.data) {
          setSessionName(res.data.name);
        }
      });
    }
  }, [sessionId]);

  // 핸드폰 번호 입력 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setPhoneLast4(value);
    }
  };

  // 다음 단계로
  const handlePhoneSubmit = () => {
    if (phoneLast4.length === 4) {
      setStep('status');
    }
  };

  // 출석 체크 제출
  const handleSubmit = async () => {
    if (!status || !sessionId) return;

    setLoading(true);

    const result = await submitAttendance(
      sessionId,
      phoneLast4,
      status,
      status === 'absent' ? reason : undefined
    );

    setLoading(false);

    if (result.success) {
      setStep('complete');
      // 1.2초 후 자동 종료 (선택사항)
      // setTimeout(() => window.close(), 1200);
    } else {
      alert(result.error || '출석 체크에 실패했습니다');
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] px-4">
        <p className="text-white/70">세션 ID가 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {sessionName || '출석 체크'}
          </h1>
          <p className="text-white/50 text-sm">
            {step === 'phone' && '핸드폰 번호 뒷자리 4자리를 입력해주세요'}
            {step === 'status' && '참석 여부를 선택해주세요'}
            {step === 'complete' && '출석이 기록되었습니다'}
          </p>
        </div>

        {/* Step 1: 핸드폰 번호 입력 */}
        {step === 'phone' && (
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={phoneLast4}
                onChange={handlePhoneChange}
                placeholder="0000"
                maxLength={4}
                className="w-full h-16 px-6 text-center text-2xl font-semibold rounded-2xl bg-white/8 border border-white/14 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              {phoneLast4.length === 4 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>

            <button
              onClick={handlePhoneSubmit}
              disabled={phoneLast4.length !== 4}
              className="w-full h-14 rounded-2xl font-semibold text-base transition-all disabled:opacity-40"
              style={{
                background: phoneLast4.length === 4 ? '#353C49' : '#1A1D23',
                color: '#FFFFFF',
              }}
            >
              계속하기
            </button>
          </div>
        )}

        {/* Step 2: 참석/불참 선택 */}
        {step === 'status' && (
          <div className="space-y-6">
            {/* 라디오 버튼 (Pill Style) */}
            <div className="flex gap-3">
              <button
                onClick={() => setStatus('attend')}
                className={`flex-1 h-14 rounded-full font-semibold transition-all ${
                  status === 'attend'
                    ? 'bg-white text-black'
                    : 'bg-white/8 text-white/70 border border-white/14'
                }`}
              >
                참석
              </button>
              <button
                onClick={() => setStatus('absent')}
                className={`flex-1 h-14 rounded-full font-semibold transition-all ${
                  status === 'absent'
                    ? 'bg-white text-black'
                    : 'bg-white/8 text-white/70 border border-white/14'
                }`}
              >
                불참
              </button>
            </div>

            {/* 불참 사유 입력 (슬라이드다운) */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                status === 'absent'
                  ? 'max-h-40 opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="불참 사유를 입력해주세요 (선택)"
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/14 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors resize-none"
              />
            </div>

            {/* 보내기 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={!status || loading}
              className="w-full h-14 rounded-2xl font-semibold text-base transition-all disabled:opacity-40"
              style={{
                background: status ? '#353C49' : '#1A1D23',
                color: '#FFFFFF',
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
              }}
              className="w-full text-white/50 text-sm hover:text-white/70 transition-colors"
            >
              ← 뒤로가기
            </button>
          </div>
        )}

        {/* Step 3: 완료 */}
        {step === 'complete' && (
          <div className="text-center space-y-6 py-12">
            <div className="text-6xl">🙌</div>
            <h2 className="text-2xl font-bold text-white">
              출석이 기록되었습니다
            </h2>
            <p className="text-white/60">
              {status === 'attend' ? '참석' : '불참'} 처리가 완료되었습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
