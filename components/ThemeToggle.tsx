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
              background: '#ffffff',
              position: 'relative',
              transition: 'transform .25s ease',
              transform: isDark ? 'translateX(36px)' : 'translateX(0)',
            }}
          >
            {/* SUN 아이콘 */}
            <span
              className="icon icon-sun"
              style={{
                position: 'absolute',
                inset: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isDark ? 0 : 1,
                transition: 'opacity .2s ease',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#ff962a',
                  boxShadow: `
                    0 -8px 0 0 #ff962a,
                    0  8px 0 0 #ff962a,
                    8px  0 0 0 #ff962a,
                   -8px  0 0 0 #ff962a,
                    6px  6px 0 0 #ff962a,
                   -6px  6px 0 0 #ff962a,
                    6px -6px 0 0 #ff962a,
                   -6px -6px 0 0 #ff962a
                  `,
                }}
              />
            </span>

            {/* MOON 아이콘 */}
            <span
              className="icon icon-moon"
              style={{
                position: 'absolute',
                inset: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isDark ? 1 : 0,
                transition: 'opacity .2s ease',
              }}
            >
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#333333',
                  boxShadow: '-5px 0 0 0 #ffffff',
                }}
              />
            </span>
          </span>
        </span>
      </label>
    </div>
  );
}
