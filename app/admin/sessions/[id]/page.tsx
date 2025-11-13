import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getSessionById,
  getSessionAttendance,
  getAbsentMembers,
  deleteSession,
} from '@/lib/actions/sessions';
import { formatDate } from '@/lib/utils';
import DeleteButton from './DeleteButton';
import CopyLinkButton from './CopyLinkButton';
import ExportCSVButton from './ExportCSVButton';

export const dynamic = 'force-dynamic';

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionById(params.id);

  if (!session) {
    notFound();
  }

  const attendance = await getSessionAttendance(params.id);
  const absentMembers = await getAbsentMembers(params.id);

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/s/${session.publicToken}`;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/sessions"
          className="text-gray-600 hover:text-black transition-colors"
        >
          ← Back
        </Link>
        <h2 className="text-lg font-semibold">Session Detail</h2>
      </div>

      <div className="border border-gray-200 rounded-xl px-4 py-4 mb-6">
        <h3 className="font-semibold text-lg mb-2">{session.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{formatDate(session.date)}</p>
        {session.note && (
          <p className="text-sm text-gray-700 mb-4">{session.note}</p>
        )}

        <div className="flex flex-col gap-2">
          <CopyLinkButton url={publicUrl} />
          <ExportCSVButton sessionId={params.id} />
          <Link
            href={`/admin/sessions/${params.id}/edit`}
            className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium flex items-center justify-center hover:border-black transition-colors"
          >
            Edit Session
          </Link>
          <DeleteButton sessionId={params.id} sessionName={session.name} />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-3">
          Attended ({attendance.length})
        </h3>
        {attendance.length === 0 ? (
          <p className="text-sm text-gray-500">No attendance yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {attendance.map((att) => (
              <div
                key={att.id}
                className="border border-gray-200 rounded-lg px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{att.memberName}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {att.memberGroup}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(att.checkedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-medium mb-3">
          Absent ({absentMembers.length})
        </h3>
        {absentMembers.length === 0 ? (
          <p className="text-sm text-gray-500">Everyone attended!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {absentMembers.map((member) => (
              <div
                key={member.id}
                className="border border-gray-200 rounded-lg px-3 py-2"
              >
                <span className="font-medium">{member.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {member.group}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
