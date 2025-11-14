import Link from 'next/link';
import { getAllMembers } from '@/lib/actions/members';
import MemberFilter from '@/components/MemberFilter';

type Member = {
  id: string;
  name: string;
  group: string;
  isActive: boolean;
  createdAt: Date;
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const filter = searchParams.filter;
  const members = await getAllMembers(filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
          Members
        </h2>
        <Link
          href="/admin/members/new"
          className="h-9 px-4 rounded-lg text-sm font-medium flex items-center transition-all hover:bg-[#2A303B]"
          style={{
            background: '#353C49',
            color: '#FFFFFF',
          }}
        >
          Add Member
        </Link>
      </div>

      <MemberFilter />

      {members.length === 0 ? (
        <div className="text-center py-12" style={{
          color: 'rgba(255,255,255,0.5)'
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
                className="rounded-lg px-5 py-4 transition-all hover:bg-[rgba(255,255,255,0.08)]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{ color: '#FFFFFF' }}
                      >
                        {member.name}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                      >
                        {member.group}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
