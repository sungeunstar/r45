'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/lib/actions/auth';

interface AdminNavProps {
  churchName?: string;
  userName?: string;
}

export default function AdminNav({ churchName, userName }: AdminNavProps) {
  const pathname = usePathname();

  const tabs = [
    { name: '일정', href: '/admin' },
    { name: '멤버', href: '/admin/members' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="mb-6 admin-nav-border">
      {/* 상단: Flowing Chat + 로그아웃 */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold admin-nav-title">
          Flowing Chat
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

      {/* 교회이름 + 인사 */}
      {churchName && (
        <div className="mb-4">
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', margin: 0 }}>
            {churchName}
          </p>
          {userName && (
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0' }}>
              안녕하세요, {userName}님
            </p>
          )}
        </div>
      )}

      {/* 탭 네비게이션 */}
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
