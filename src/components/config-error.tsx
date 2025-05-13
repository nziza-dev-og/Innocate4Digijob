"use client";

import React, { useState, useEffect } from 'react';

const requiredFirebaseVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];
const otherRequiredVars = ['NEXT_PUBLIC_ADMIN_SECRET_CODE'];

export function ConfigErrorWrapper({ children }: { children: React.ReactNode }) {
  const [hasConfigError, setHasConfigError] = useState(false);
  const [missingVars, setMissingVars] = useState<string[]>([]);

  useEffect(() => {
    const missingFirebase = requiredFirebaseVars.filter(key => !process.env[key]);
    const missingOther = otherRequiredVars.filter(key => !process.env[key]);
    const allMissing = [...missingFirebase, ...missingOther];

    if (allMissing.length > 0) {
        console.error("Configuration Error: Missing environment variables detected on client-side:", allMissing.join(', '));
        setMissingVars(allMissing);
        setHasConfigError(true);
    } else {
        setHasConfigError(false);
        setMissingVars([]);
    }
  }, []); // Run only once on mount

  if (hasConfigError) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        color: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        zIndex: 1000,
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '2rem 3rem',
          borderRadius: '8px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
          maxWidth: '600px',
          textAlign: 'center',
        }}>
          <h1 style={{ color: '#ff6b6b', fontSize: '1.75rem', marginBottom: '1rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>Configuration Error</h1>
          <h2 style={{ color: '#ffcc00', fontSize: '1.25rem', marginBottom: '1rem' }}>Firebase Initialization Failed</h2>
          <p style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Critical environment variables required for Firebase are missing. The application cannot connect to backend services.
          </p>
          <p style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Please check the following:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left', display: 'inline-block' }}>
            <li style={{ marginBottom: '0.5rem' }}>✅ Ensure a <strong>.env</strong> file exists in the project root.</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ Verify all <strong>NEXT_PUBLIC_FIREBASE_...</strong> variables are correctly set in your <strong>.env</strong> file.</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ Verify the <strong>NEXT_PUBLIC_ADMIN_SECRET_CODE</strong> is set in your <strong>.env</strong> file.</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ If deployed, ensure these environment variables are configured in your <strong>hosting provider's settings</strong>.</li>
          </ul>
           {missingVars.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: '4px', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                    <p style={{ color: '#ffcccc', fontSize: '0.9rem', margin: 0 }}>Missing: {missingVars.join(', ')}</p>
                </div>
            )}
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#aaa' }}>
            Refer to the <strong>README.md</strong> file for detailed setup instructions.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
