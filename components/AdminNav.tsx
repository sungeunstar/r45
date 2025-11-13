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
    <div className="mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-white">R45 Worship Team</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="text-sm transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)' }}
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
            className="pb-3 text-sm font-medium transition-colors relative"
            style={{
              color: isActive(tab.href) ? '#FFFFFF' : 'rgba(255,255,255,0.5)'
            }}
          >
            {tab.name}
            {isActive(tab.href) && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
