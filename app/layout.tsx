import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SchoolFix — Mobile-First Attendance & Tuition Reconciliation',
    template: '%s | SchoolFix',
  },
  description: 'Mobile-first school records and fee reconciliation for African schools.',
  keywords: [
    'school management',
    'tuition reconciliation',
    'continuous assessment',
    'attendance register',
    'Nigerian private schools',
  ],
  authors: [{ name: 'SchoolFix Engineering' }],
  creator: 'SchoolFix',
  publisher: 'SchoolFix Technologies',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://schoolfix.internal',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'SchoolFix — Mobile-First Attendance & Tuition Reconciliation',
    description: 'Mobile-first school records and fee reconciliation for African schools.',
    url: 'https://schoolfix.internal',
    siteName: 'SchoolFix',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SchoolFix — Mobile-First Attendance & Tuition Reconciliation',
    description: 'Mobile-first school records and fee reconciliation for African schools.',
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
