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
        background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
        color: '#000000',
      } : {
        background: '#3b82f6',
        color: '#FFFFFF',
      }}
    >
      {copied ? 'Copied!' : 'Copy Check-in Link'}
    </button>
  );
}
