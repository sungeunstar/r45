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
      className="h-9 px-4 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete Session'}
    </button>
  );
}
