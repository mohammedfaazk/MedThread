import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/accessibility.css';
import { JWTAuthProvider } from '@/context/JWTAuthContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EmergencyBroadcastBanner } from '@/components/EmergencyBroadcastBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MedThread - Healthcare Platform',
  description: 'Connect with doctors, manage your health, and access medical resources',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MedThread'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <JWTAuthProvider>
            <AccessibilityProvider>
              {/* Skip to main content link for screen readers */}
              <a href="#main-content" className="skip-to-main">
                Skip to main content
              </a>

              {/* Emergency Broadcasts */}
              <EmergencyBroadcastBanner />

              {/* Offline Indicator */}
              <OfflineIndicator />

              {/* Main Content */}
              <main id="main-content">
                {children}
              </main>

              {/* Accessibility Panel */}
              <AccessibilityPanel />
            </AccessibilityProvider>
          </JWTAuthProvider>
        </ErrorBoundary>

        {/* Keyboard navigation detection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function handleFirstTab(e) {
                  if (e.keyCode === 9) {
                    document.body.classList.add('user-is-tabbing');
                    window.removeEventListener('keydown', handleFirstTab);
                    window.addEventListener('mousedown', handleMouseDownOnce);
                  }
                }
                function handleMouseDownOnce() {
                  document.body.classList.remove('user-is-tabbing');
                  window.removeEventListener('mousedown', handleMouseDownOnce);
                  window.addEventListener('keydown', handleFirstTab);
                }
                window.addEventListener('keydown', handleFirstTab);
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
