export default function NewSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[420px] mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
