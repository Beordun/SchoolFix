import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthCard from './AuthCard';

export const metadata: Metadata = {
  title: 'Portal Access & Verification',
  description: 'Single-page authentication gateway for SchoolFix attendance and tuition reconciliation.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading portal gateway...</div>}>
      <AuthCard />
    </Suspense>
  );
}
