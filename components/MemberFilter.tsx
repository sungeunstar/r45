'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const groups = ['all', '보컬', '악기', '음향'];
const groupEmojis: { [key: string]: string } = {
  'all': '👥',
  '보컬': '🎤',
  '악기': '🎸',
  '음향': '🎚️'
};

export default function MemberFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';

  function handleFilterChange(newFilter: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', newFilter);
    }
    router.push(`/admin/members?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 mb-6" style={{
      borderBottom: '1px solid rgba(255,255,255,0.12)'
    }}>
      {groups.map((group) => (
        <button
          key={group}
          onClick={() => handleFilterChange(group)}
          className="pb-3 px-3 text-sm font-medium transition-colors relative"
          style={{
            color: filter === group ? '#FFFFFF' : 'rgba(255,255,255,0.5)'
          }}
        >
          {groupEmojis[group]} {group === 'all' ? 'All' : group}
          {filter === group && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: '#FFFFFF' }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
