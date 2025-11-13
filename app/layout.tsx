import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Joyful Church - R45 Worship Team',
  description: 'Attendance check-in system for R45 Worship Team',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
