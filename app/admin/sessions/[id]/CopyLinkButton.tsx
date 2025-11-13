'use client';

import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function CopyLinkButton({ url }: { url: string }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="h-11 px-4 rounded-xl text-sm font-semibold transition-all"
      style={theme === 'dark' ? {
        background: '#353C49',
        color: '#FFFFFF',
      } : {
        background: '#1A1E27',
        color: '#FFFFFF',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = theme === 'dark' ? '#2A303B' : '#151823';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = theme === 'dark' ? '#353C49' : '#1A1E27';
      }}
    >
      {copied ? 'Copied!' : 'Copy Check-in Link'}
    </button>
  );
}
