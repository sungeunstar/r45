'use client';

import { useState } from 'react';

export default function CopyLinkButton({ url }: { url: string }) {
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
      style={{
        background: '#353C49',
        color: '#FFFFFF',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#2A303B';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#353C49';
      }}
    >
      {copied ? 'Copied!' : 'Copy Check-in Link'}
    </button>
  );
}
