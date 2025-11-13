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
    if (!confirm(`Are you sure you want to delete "${sessionName}"?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteSession(sessionId);

    if (result.success) {
      router.push('/admin/sessions');
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete session');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="h-11 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
      style={{
        background: '#FF5555',
        color: '#FFFFFF',
      }}
    >
      {loading ? 'Deleting...' : 'Delete Session'}
    </button>
  );
}
