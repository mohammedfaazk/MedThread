'use client';

import { useState } from 'react';
import LoaderPage from '@/components/LoaderPage';

export default function LoaderDemoPage() {
  const [showLoader, setShowLoader] = useState(true);

  if (showLoader) {
    return <LoaderPage onLoadComplete={() => setShowLoader(false)} />;
  }

  return (
    <div style={{ 
      padding: '40px', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1623 0%, #162033 50%, #1a2744 100%)',
      color: '#f3f6fa'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Loader Complete!</h1>
      <p style={{ fontSize: '16px', color: '#8a9bb5', marginBottom: '20px' }}>
        The animated loader has finished and you've been "navigated" to this page.
      </p>
      <button
        onClick={() => setShowLoader(true)}
        style={{
          padding: '12px 24px',
          background: '#669ae3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        Show Loader Again
      </button>
    </div>
  );
}
