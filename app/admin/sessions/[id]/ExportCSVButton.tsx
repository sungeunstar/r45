'use client';

import { useState } from 'react';
import { exportAttendanceCSV } from '@/lib/actions/attendance';

export default function ExportCSVButton({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    try {
      const csv = await exportAttendanceCSV(sessionId);

      if (!csv) {
        alert('Failed to export CSV');
        return;
      }

      // Create download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${sessionId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export CSV');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:border-black transition-colors disabled:opacity-50"
    >
      {loading ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
