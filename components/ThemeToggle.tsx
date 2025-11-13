'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // 초기 테마 설정 (로컬스토리지에서 가져오거나 기본값 dark)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    const initialIsDark = initialTheme === 'dark';
    setIsDark(initialIsDark);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    const newTheme = newIsDark ? 'dark' : 'light';
    setIsDark(newIsDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="header-theme-toggle" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <label className="theme-toggle" style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={isDark}
          onChange={toggleTheme}
          style={{ display: 'none' }}
          aria-label="Toggle dark mode"
        />
        <span
          className="track"
          style={{
            width: '72px',
            height: '36px',
            padding: '4px',
            borderRadius: '999px',
            background: isDark ? '#3b3c3f' : '#ff962a',
            display: 'flex',
            alignItems: 'center',
            transition: 'background .25s ease',
          }}
        >
          <span
            className="knob"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              position: 'relative',
              transition: 'transform .25s ease',
              transform: isDark ? 'translateX(36px)' : 'translateX(0)',
              overflow: 'hidden',
            }}
          >
            {/* SUN 아이콘 - 라이트 모드 */}
            <span
              style={{
                position: 'absolute',
                inset: '0',
                opacity: isDark ? 0 : 1,
                transition: 'opacity .2s ease',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="14" fill="white"/>
                <path d="M14.5 21H13.5V19H14.5V21ZM10.8184 17.8887L9.4043 19.3037L8.69727 18.5957L10.1113 17.1816L10.8184 17.8887ZM19.3037 18.5967L18.5967 19.3037L17.1826 17.8887L17.8896 17.1816L19.3037 18.5967ZM14 11C15.6569 11 17 12.3431 17 14C17 15.6569 15.6569 17 14 17C12.3431 17 11 15.6569 11 14C11 12.3431 12.3431 11 14 11ZM9 14.5H7V13.5H9V14.5ZM21 14.5H19V13.5H21V14.5ZM10.8184 10.1113L10.1113 10.8184L8.69727 9.4043L9.4043 8.69629L10.8184 10.1113ZM19.3037 9.40332L17.8896 10.8184L17.1826 10.1113L18.5967 8.69629L19.3037 9.40332ZM14.5 9H13.5V7H14.5V9Z" fill="#FF8D28"/>
              </svg>
            </span>

            {/* MOON 아이콘 - 다크 모드 */}
            <span
              style={{
                position: 'absolute',
                inset: '0',
                opacity: isDark ? 1 : 0,
                transition: 'opacity .2s ease',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="14" fill="white"/>
                <path d="M14.9717 7.5C17.8402 8.05777 20.001 10.5053 20.001 13.4404C20.001 16.7873 17.1913 19.5 13.7266 19.5C11.1755 19.4998 8.98137 18.0287 8.00098 15.917C8.40348 15.9953 8.8197 16.0381 9.24609 16.0381C12.7109 16.0381 15.5205 13.3244 15.5205 9.97754C15.5205 9.09464 15.3231 8.25652 14.9717 7.5Z" fill="#212123"/>
              </svg>
            </span>
          </span>
        </span>
      </label>
    </div>
  );
}
