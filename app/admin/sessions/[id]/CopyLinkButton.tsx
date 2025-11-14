'use client';

import { useState, useRef, useEffect } from 'react';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="h-11 px-4 rounded-xl text-sm font-semibold transition-all hover:bg-[#2A303B]"
      style={{
        background: '#353C49',
        color: '#FFFFFF',
      }}
    >
      {copied ? 'Copied!' : 'Copy Check-in Link'}
    </button>
  );
}
