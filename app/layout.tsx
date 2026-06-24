import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '절세 추천 - 주식 절세 Top 5',
  description: '연봉·나이·투자 현황 기반 절세 상품 Top 5 추천',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
