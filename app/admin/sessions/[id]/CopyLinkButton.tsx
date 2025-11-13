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
      className="h-11 px-4 rounded-xl text-sm font-semibold transition-all text-black"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
      }}
    >
      {copied ? 'Copied!' : 'Copy Check-in Link'}
    </button>
  );
}
