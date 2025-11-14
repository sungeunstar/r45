'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteSession } from '@/lib/actions/sessions';

export default function DeleteButton({
  sessionId,
  sessionName,
}: {
  sessionId: string;
  sessionName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`정말 "${sessionName}" 세션을 삭제하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteSession(sessionId);

    if (result.success) {
      router.push('/admin/sessions');
      router.refresh();
    } else {
      alert(result.error || '세션 삭제에 실패했습니다');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="h-11 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
      style={{
        background: '#FF5F5F',
        color: '#FFFFFF',
      }}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.background = '#E64B4B';
      }}
      onMouseLeave={(e) => {
        if (!loading) e.currentTarget.style.background = '#FF5F5F';
      }}
    >
      {loading ? '삭제 중...' : '세션 삭제'}
    </button>
  );
}
