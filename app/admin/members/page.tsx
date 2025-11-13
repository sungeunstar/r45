'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllMembers } from '@/lib/actions/members';
import { useTheme } from '@/hooks/useTheme';

type Member = {
  id: string;
  name: string;
  group: string;
  isActive: boolean;
  createdAt: Date;
};

export default function MembersPage() {
  const theme = useTheme();
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      setLoading(true);
      const data = await getAllMembers(filter === 'all' ? undefined : filter);
      setMembers(data);
      setLoading(false);
    }
    loadMembers();
  }, [filter]);

  const groups = ['all', '보컬', '악기', '음향'];
  const groupEmojis: { [key: string]: string } = {
    'all': '👥',
    '보컬': '🎤',
    '악기': '🎸',
    '음향': '🎚️'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>
          Members
        </h2>
        <Link
          href="/admin/members/new"
          className="h-9 px-4 rounded-lg text-sm font-medium flex items-center transition-all"
          style={theme === 'dark' ? {
            background: 'linear-gradient(180deg, #FFFFFF 0%, #DADADA 100%)',
            color: '#000000',
          } : {
            background: '#000000',
            color: '#FFFFFF',
          }}
        >
          Add Member
        </Link>
      </div>

      <div className="flex gap-2 mb-6" style={{
        borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e5e7eb'
      }}>
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setFilter(group)}
            className="pb-3 px-3 text-sm font-medium transition-colors relative"
            style={{
              color: filter === group
                ? (theme === 'dark' ? '#FFFFFF' : '#000000')
                : (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
            }}
          >
            {groupEmojis[group]} {group === 'all' ? 'All' : group}
            {filter === group && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: theme === 'dark' ? '#FFFFFF' : '#000000' }}
              />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12" style={{
          color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
        }}>
          <p>Loading...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12" style={{
          color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
        }}>
          <p>No members found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((member) => {
            const emoji = member.group === '보컬' ? '🎤' : member.group === '악기' ? '🎸' : '🎚️';
            return (
              <Link
                key={member.id}
                href={`/admin/members/${member.id}/edit`}
                className="rounded-lg px-5 py-4 transition-all"
                style={theme === 'dark' ? {
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                } : {
                  background: '#FFFFFF',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}
                      >
                        {member.name}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                      >
                        {member.group}
                      </p>
                    </div>
                  </div>
                  {!member.isActive && (
                    <span className="text-xs px-2 py-1 rounded" style={theme === 'dark' ? {
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)'
                    } : {
                      background: 'rgba(0,0,0,0.05)',
                      color: 'rgba(0,0,0,0.5)'
                    }}>
                      Inactive
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
