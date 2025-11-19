'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/lib/actions/auth';

interface AdminNavProps {
  churchName?: string;
}

export default function AdminNav({ churchName }: AdminNavProps) {
  const pathname = usePathname();

  const tabs = [
    { name: '일정', href: '/admin/sessions' },
    { name: '멤버', href: '/admin/members' },
    { name: '관리자', href: '/admin/admins' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="mb-6 admin-nav-border">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold admin-nav-title">
          {churchName || 'Flowing Chat'}
        </h1>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="text-sm transition-colors admin-nav-logout"
          >
            로그아웃
          </button>
        </form>
      </div>

      <nav className="flex gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="pb-3 text-sm font-medium transition-colors relative admin-nav-tab"
            data-active={isActive(tab.href)}
          >
            {tab.name}
            {isActive(tab.href) && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 admin-nav-indicator" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
