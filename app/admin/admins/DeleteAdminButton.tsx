'use client';

import { useState } from 'react';
import { deleteAdminUser } from '@/lib/actions/admin-users';
import { useRouter } from 'next/navigation';

export default function DeleteAdminButton({
  adminId,
  email,
}: {
  adminId: string;
  email: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete admin "${email}"?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteAdminUser(adminId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete admin');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="h-8 px-3 rounded-lg text-sm transition-colors disabled:opacity-50"
      style={{
        background: 'rgba(239,68,68,0.15)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: 'rgba(239,68,68,1)',
      }}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
