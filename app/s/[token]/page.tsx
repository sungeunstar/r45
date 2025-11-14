import { notFound } from 'next/navigation';
import { getSessionByToken } from '@/lib/actions/sessions';
import { formatDate } from '@/lib/utils';
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

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="max-w-[420px] mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-3 text-white">{session.name}</h1>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {formatDate(session.date)}
          </p>
          {session.note && (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{session.note}</p>
          )}
        </div>

        <CheckInForm sessionToken={params.token} />
      </div>
    </div>
  );
}
