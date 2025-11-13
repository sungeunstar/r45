export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-[420px] text-center">
        <h1 className="text-2xl font-semibold mb-2">Session Not Found</h1>
        <p className="text-gray-600">
          This check-in link is invalid or has expired.
        </p>
      </div>
    </div>
  );
}
