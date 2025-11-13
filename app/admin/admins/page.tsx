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
        <h2 className="text-lg font-semibold">Admin Users</h2>
        <Link
          href="/admin/admins/new"
          className="h-9 px-4 bg-black text-white rounded-lg text-sm font-medium flex items-center hover:bg-gray-800 transition-colors"
        >
          Add Admin
        </Link>
      </div>

      {admins.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No admin users</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="border border-gray-200 rounded-xl px-4 py-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium">{admin.email}</h3>
                  <p className="text-sm text-gray-500">
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
