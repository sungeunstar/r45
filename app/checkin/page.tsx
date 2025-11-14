import { Suspense } from 'react';
import CheckInContent from './CheckInContent';

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
          <p className="text-white/70">로딩 중...</p>
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}

