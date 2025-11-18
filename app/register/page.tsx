'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerChurch } from '@/lib/actions/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    churchName: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.churchName.trim()) {
      setError('교회명을 입력해주세요.');
      return;
    }
    if (!formData.adminName.trim()) {
      setError('관리자 이름을 입력해주세요.');
      return;
    }
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!formData.password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerChurch(
        formData.churchName,
        formData.adminName,
        formData.email,
        formData.password
      );

      if (result.success) {
        router.push('/admin');
      } else {
        setError(result.error || '등록에 실패했습니다.');
      }
    } catch (err) {
      setError('등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: '8px',
            }}
          >
            교회 등록
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            새로운 교회를 등록하고 일정/출석 관리를 시작하세요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '18px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* 교회명 */}
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
                교회명
              </label>
              <input
                type="text"
                value={formData.churchName}
                onChange={(e) =>
                  setFormData({ ...formData, churchName: e.target.value })
                }
                placeholder="예: 행복한교회"
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

            {/* 관리자 이름 */}
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
                관리자 이름
              </label>
              <input
                type="text"
                value={formData.adminName}
                onChange={(e) =>
                  setFormData({ ...formData, adminName: e.target.value })
                }
                placeholder="예: 김목사"
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

            {/* 이메일 */}
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
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="admin@church.com"
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

            {/* 비밀번호 */}
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
                비밀번호
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="6자 이상"
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

            {/* 비밀번호 확인 */}
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
                비밀번호 확인
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="비밀번호를 다시 입력"
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

            {/* 에러 메시지 */}
            {error && (
              <div
                style={{
                  padding: '12px',
                  background: 'rgba(255, 95, 95, 0.1)',
                  borderRadius: '8px',
                  color: 'rgb(255, 95, 95)',
                  fontSize: '14px',
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}

            {/* 등록 버튼 */}
            <button
              type="submit"
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
                marginTop: '8px',
              }}
            >
              {isLoading ? '등록 중...' : '교회 등록하기'}
            </button>
          </div>
        </form>

        {/* 로그인 링크 */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            이미 계정이 있으신가요?{' '}
            <Link
              href="/admin/login"
              style={{
                color: '#FFFFFF',
                textDecoration: 'underline',
              }}
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
