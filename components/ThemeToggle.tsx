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
      className="theme-toggle"
      style={{
        width: '48px',
        height: '26px',
        background: theme === 'light' ? '#e3e3e3' : '#333333',
        borderRadius: '30px',
        padding: '3px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.25s ease',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
    >
      {/* 심플한 원형 thumb */}
      <span
        className="toggle-thumb"
        style={{
          width: '20px',
          height: '20px',
          background: '#ffffff',
          borderRadius: '50%',
          transition: 'transform 0.25s ease',
          transform: theme === 'dark' ? 'translateX(22px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}
