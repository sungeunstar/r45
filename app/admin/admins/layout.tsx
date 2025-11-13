import AdminNav from '@/components/AdminNav';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[420px] mx-auto px-4 py-6">
        <AdminNav />
        {children}
      </div>
    </div>
  );
}
