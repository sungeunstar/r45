'use client';

import AdminNav from '@/components/AdminNav';
import { usePathname } from 'next/navigation';

export default function SessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNav = pathname?.includes('/new') || pathname?.includes('/success');

  return (
    <div className="min-h-screen">
      <div className="max-w-[420px] mx-auto px-4 py-6">
        {!hideNav && <AdminNav />}
        {children}
      </div>
    </div>
  );
}
