export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
      <div className="max-w-[420px] text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-3">Session Not Found</h1>
        <p className="text-white/60">
          This check-in link is invalid or has expired.
        </p>
      </div>
    </div>
  );
}
