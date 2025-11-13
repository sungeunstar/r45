'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/lib/actions/auth';
import ThemeToggle from './ThemeToggle';

export default function AdminNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Sessions', href: '/admin/sessions' },
    { name: 'Members', href: '/admin/members' },
    { name: 'Admin Users', href: '/admin/admins' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="mb-6 admin-nav-border">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold admin-nav-title">R45 Worship Team</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="text-sm transition-colors admin-nav-logout"
            >
              Logout
            </button>
          </form>
        </div>
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
