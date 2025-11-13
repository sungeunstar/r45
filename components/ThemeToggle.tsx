'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // 초기 테마 설정 (로컬스토리지에서 가져오거나 기본값 dark)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="theme-toggle-button"
      style={{
        position: 'relative',
        width: '56px',
        height: '30px',
        borderRadius: '999px',
        backgroundColor: theme === 'light' ? '#FFA52F' : '#3A3A3F',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.25s ease',
        padding: 0,
        outline: 'none',
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
    >
      {/* 슬라이딩 핸들 (흰색 원) */}
      <div
        className="theme-toggle-handle"
        style={{
          position: 'absolute',
          top: '3px',
          left: theme === 'light' ? '3px' : 'calc(100% - 27px)',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          transition: 'left 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* 라이트 모드: 해 모양 */}
        {theme === 'light' && (
          <div
            style={{
              position: 'relative',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#FFA52F',
            }}
          >
            {/* 햇살 라인들 */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <div
                key={angle}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '2px',
                  height: '5px',
                  backgroundColor: '#FFA52F',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-7px)`,
                  borderRadius: '1px',
                }}
              />
            ))}
          </div>
        )}

        {/* 다크 모드: 달 모양 */}
        {theme === 'dark' && (
          <div
            style={{
              position: 'relative',
              width: '14px',
              height: '14px',
            }}
          >
            {/* 흰 원 (달의 기본) */}
            <div
              style={{
                position: 'absolute',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#3A3A3F',
              }}
            />
            {/* 겹친 원으로 초승달 만들기 */}
            <div
              style={{
                position: 'absolute',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                transform: 'translateX(-2px)',
              }}
            />
          </div>
        )}
      </div>
    </button>
  );
}
