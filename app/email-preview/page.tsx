// app/email-preview/page.tsx
// Visual preview of the branded SchoolFix transactional verification email

import React from 'react';
import { renderVerificationEmailHtml } from '@/lib/security/email-worker';

export default function EmailPreviewPage() {
  const htmlContent = renderVerificationEmailHtml('Zainab Balogun', '241925');

  return (
    <div style={{ padding: '2rem', background: '#E2E8F0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: '1rem', color: '#4B0082', fontWeight: 700, fontSize: '1.25rem' }}>
        SchoolFix Transactional Email Preview (Design System Tokens)
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{ width: '100%', maxWidth: '600px' }}
      />
    </div>
  );
}
