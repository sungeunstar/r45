import Link from 'next/link';
import { getAllAdmins } from '@/lib/actions/admin-users';
import { formatDate } from '@/lib/utils';
import DeleteAdminButton from './DeleteAdminButton';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const admins = await getAllAdmins();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Admin Users</h2>
        <Link
          href="/admin/admins/new"
          className="h-9 px-4 rounded-lg text-sm font-medium flex items-center transition-all text-black"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
          }}
        >
          Add Admin
        </Link>
      </div>

      {admins.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <p>No admin users</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="rounded-[18px] px-5 py-4"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{admin.email}</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
