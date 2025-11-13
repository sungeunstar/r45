'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

type Option = {
  value: string;
  label: string;
  icon?: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
};

export default function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[52px] px-4 rounded-xl transition-all focus:outline-none flex items-center justify-between"
        style={theme === 'dark' ? {
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
          color: '#FFFFFF',
        } : {
          backgroundColor: '#FFFFFF',
          border: '1px solid #D4D7DF',
          color: '#1A1E27',
        }}
      >
        <span className="text-base">
          {selectedOption ? `${selectedOption.icon || ''} ${selectedOption.label}` : placeholder}
        </span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeOpacity="0.7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-2 overflow-hidden"
          style={{
            top: '100%',
            zIndex: 1000,
            borderRadius: '12px',
            ...(theme === 'dark' ? {
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            } : {
              backgroundColor: '#FFFFFF',
              border: '1px solid #D4D7DF',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            }),
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className="w-full px-4 py-3.5 text-left transition-colors flex items-center gap-2"
              style={{
                ...(theme === 'dark' ? {
                  color: '#FFFFFF',
                  backgroundColor: value === option.value ? 'rgba(255,255,255,0.08)' : 'transparent',
                } : {
                  color: '#1A1E27',
                  backgroundColor: value === option.value ? '#F6F7FA' : 'transparent',
                }),
                ...(theme === 'dark'
                  ? { ':hover': { backgroundColor: 'rgba(255,255,255,0.06)' } }
                  : { ':hover': { backgroundColor: '#F6F7FA' } }
                ),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#F6F7FA';
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                } else {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#F6F7FA';
                }
              }}
            >
              {option.icon && <span className="text-base">{option.icon}</span>}
              <span className="text-base">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
