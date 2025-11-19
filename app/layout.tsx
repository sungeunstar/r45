import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flowing Chat - 교회 일정/출석 관리',
  description: '교회 및 예배팀을 위한 일정 관리 및 출석 체크 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
