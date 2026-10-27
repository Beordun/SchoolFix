import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SchoolFix — Attendance & Tuition Clarity',
    template: '%s | SchoolFix',
  },
  description: 'Mobile-first school records and fee reconciliation for African schools.',
  openGraph: {
    title: 'SchoolFix — Attendance & Tuition Clarity',
    description: 'Mobile-first school records and fee reconciliation for African schools.',
    type: 'website',
    siteName: 'SchoolFix',
    locale: 'en_NG',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4B0082',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
