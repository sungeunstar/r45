'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllMembers } from '@/lib/actions/members';

type Member = {
  id: string;
  name: string;
  group: string;
  isActive: boolean;
  createdAt: Date;
};

export default function MembersPage() {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Members</h2>
        <Link
          href="/admin/members/new"
          className="h-9 px-4 bg-black text-white rounded-lg text-sm font-medium flex items-center hover:bg-gray-800 transition-colors"
        >
          Add Member
        </Link>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setFilter(group)}
            className={`pb-3 px-3 text-sm font-medium transition-colors relative ${
              filter === group
                ? 'text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {group === 'all' ? 'All' : group}
            {filter === group && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <p>Loading...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No members found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/admin/members/${member.id}/edit`}
              className="border border-gray-200 rounded-xl px-4 py-3 hover:border-black transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.group}</p>
                </div>
                {!member.isActive && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
