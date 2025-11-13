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
      className="h-9 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy Check-in Link'}
    </button>
  );
}
