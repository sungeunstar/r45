'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/lib/actions/auth';

export default function AdminNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Sessions', href: '/admin/sessions' },
    { name: 'Members', href: '/admin/members' },
    { name: 'Admin Users', href: '/admin/admins' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">R45 Worship Team</h1>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            Logout
          </button>
        </form>
      </div>

      <nav className="flex gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              isActive(tab.href)
                ? 'text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
            {isActive(tab.href) && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
