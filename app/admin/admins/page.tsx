'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllAdmins } from '@/lib/actions/admin-users';
import { formatDate } from '@/lib/utils';
import DeleteAdminButton from './DeleteAdminButton';

type Admin = {
  id: string;
  email: string;
  createdAt: Date;
};

export default function AdminUsersPage() {
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
        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
          관리자
        </h2>
        <Link
          href="/admin/admins/new"
          className="h-9 px-4 rounded-lg text-sm font-medium flex items-center transition-all"
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
          관리자 추가
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{
          color: 'rgba(255,255,255,0.5)'
        }}>
          <p>로딩 중...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12" style={{
          color: 'rgba(255,255,255,0.5)'
        }}>
          <p>관리자가 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="rounded-lg px-5 py-4"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>
                    {admin.email}
                  </h3>
                  <p className="text-sm" style={{
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    생성일 {formatDate(admin.createdAt)}
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
