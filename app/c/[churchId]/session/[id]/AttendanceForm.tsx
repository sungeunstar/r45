'use client';

import { useState, useEffect } from 'react';
import { submitAttendance, getExistingAttendance } from '@/lib/actions/sessions';

interface AttendanceFormProps {
  sessionId: string;
  isPast: boolean;
}

export default function AttendanceForm({ sessionId, isPast }: AttendanceFormProps) {
  const [step, setStep] = useState<'input' | 'select' | 'submitted'>('input');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'present' | 'absent' | null>(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  // 이름 입력 후 기존 제출 확인
  const checkExisting = async () => {
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const existing = await getExistingAttendance(sessionId, name.trim());
      if (existing) {
        setExistingStatus(existing.status);
        setStep('submitted');
      } else {
        setStep('select');
      }
    } catch (err) {
      setError('확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 출석 제출
  const handleSubmit = async () => {
    if (!status) {
      setError('참석 여부를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await submitAttendance(
        sessionId,
        name.trim(),
        status,
        status === 'absent' ? reason : undefined
      );

      if (result.success) {
        setExistingStatus(status);
        setStep('submitted');
      } else {
        setError(result.error || '제출에 실패했습니다.');
      }
    } catch (err) {
      setError('제출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPast) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '18px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
          }}
        >
          이 일정의 출석 체크 기간이 종료되었습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '18px',
        padding: '24px',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          margin: '0 0 20px',
        }}
      >
        출석 체크
      </h2>

      {/* Step 1: 이름 입력 */}
      {step === 'input' && (
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '8px',
            }}
          >
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkExisting()}
            placeholder="이름을 입력하세요"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '11px',
              fontSize: '16px',
              color: '#FFFFFF',
              outline: 'none',
              marginBottom: '16px',
            }}
          />

          {error && (
            <p
              style={{
                fontSize: '14px',
                color: 'rgb(255, 95, 95)',
                margin: '0 0 16px',
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={checkExisting}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading ? '#2A303B' : '#353C49',
              border: 'none',
              borderRadius: '11px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#FFFFFF',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? '확인 중...' : '다음'}
          </button>
        </div>
      )}

      {/* Step 2: 출석/불참 선택 */}
      {step === 'select' && (
        <div>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: '0 0 16px',
            }}
          >
            <strong style={{ color: '#FFFFFF' }}>{name}</strong>님, 참석 여부를 선택해주세요.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <button
              onClick={() => setStatus('present')}
              style={{
                padding: '20px',
                background: status === 'present' ? 'rgba(100, 200, 100, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                border: status === 'present' ? '2px solid rgba(100, 200, 100, 0.6)' : '2px solid transparent',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              참석
            </button>
            <button
              onClick={() => setStatus('absent')}
              style={{
                padding: '20px',
                background: status === 'absent' ? 'rgba(255, 100, 100, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                border: status === 'absent' ? '2px solid rgba(255, 100, 100, 0.6)' : '2px solid transparent',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              불참
            </button>
          </div>

          {/* 불참 사유 */}
          {status === 'absent' && (
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '8px',
                }}
              >
                불참 사유 (선택)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="사유를 입력하세요"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '11px',
                  fontSize: '16px',
                  color: '#FFFFFF',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {error && (
            <p
              style={{
                fontSize: '14px',
                color: 'rgb(255, 95, 95)',
                margin: '0 0 16px',
              }}
            >
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setStep('input');
                setStatus(null);
                setReason('');
                setError('');
              }}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '11px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              이전
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !status}
              style={{
                flex: 1,
                padding: '14px',
                background: isLoading || !status ? '#2A303B' : '#353C49',
                border: 'none',
                borderRadius: '11px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: isLoading || !status ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? '제출 중...' : '제출'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 제출 완료 */}
      {step === 'submitted' && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}
          >
            {existingStatus === 'present' ? '✅' : '📝'}
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              margin: '0 0 8px',
            }}
          >
            제출 완료!
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
            }}
          >
            {name}님은 <strong>{existingStatus === 'present' ? '참석' : '불참'}</strong>으로 등록되었습니다.
          </p>
        </div>
      )}
    </div>
  );
}
