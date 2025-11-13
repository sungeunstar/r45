'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllAdmins } from '@/lib/actions/admin-users';
import { formatDate } from '@/lib/utils';
import DeleteAdminButton from './DeleteAdminButton';
import { useTheme } from '@/hooks/useTheme';

type Admin = {
  id: string;
  email: string;
  createdAt: Date;
};

export default function AdminUsersPage() {
  const theme = useTheme();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmins() {
      const data = await getAllAdmins();
      setAdmins(data);
      setLoading(false);
    }
    loadAdmins();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
          Admin Users
        </h2>
        <Link
          href="/admin/admins/new"
          className="h-9 px-4 rounded-lg text-sm font-medium flex items-center transition-all"
          style={theme === 'dark' ? {
            background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
            color: '#000000',
          } : {
            background: '#000000',
            color: '#FFFFFF',
          }}
        >
          Add Admin
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{
          color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
        }}>
          <p>Loading...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12" style={{
          color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
        }}>
          <p>No admin users</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="rounded-lg px-5 py-4"
              style={theme === 'dark' ? {
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              } : {
                background: '#FFFFFF',
                border: '1px solid #e5e7eb',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
                    {admin.email}
                  </h3>
                  <p className="text-sm" style={{
                    color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                  }}>
                    Created {formatDate(admin.createdAt)}
                  </p>
                </div>
              </div>
              <DeleteAdminButton adminId={admin.id} email={admin.email} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
