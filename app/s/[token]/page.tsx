import { notFound } from 'next/navigation';
import { getSessionByToken } from '@/lib/actions/sessions';
import { getActiveMembers } from '@/lib/actions/members';
import CheckInForm from './CheckInForm';

export const dynamic = 'force-dynamic';

export default async function PublicCheckInPage({
  params,
}: {
  params: { token: string };
}) {
  const session = await getSessionByToken(params.token);

  if (!session) {
    notFound();
  }

  const members = await getActiveMembers();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[420px] mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">{session.name}</h1>
          {session.note && (
            <p className="text-sm text-gray-600">{session.note}</p>
          )}
        </div>

        <CheckInForm
          sessionToken={params.token}
          members={members}
        />
      </div>
    </div>
  );
}
