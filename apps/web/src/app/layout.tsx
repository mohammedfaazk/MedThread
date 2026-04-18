import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/accessibility.css';
import { JWTAuthProvider } from '@/context/JWTAuthContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { NavigationWrapper } from '@/components/NavigationWrapper';
import { ActivityHeartbeat } from '@/components/ActivityHeartbeat';
import dynamic from 'next/dynamic';

// Dynamically import Iridescence to avoid SSR issues
const Iridescence = dynamic(() => import('@/components/ui/Iridescence'), {
  ssr: false,
});

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MedThread - Healthcare Platform | Emergency Alerts & Medical Services',
  description: 'Connect with doctors, manage your health, access medical resources, and stay updated with emergency health alerts',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MedThread'
  },
  other: {
    'mobile-web-app-capable': 'yes'
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
        {/* Global Iridescent Background - Blue to Purple Gradient */}
        <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
          <Iridescence 
            color={[0.4, 0.7, 0.9]} 
            mouseReact 
            amplitude={0.1} 
            speed={0.8} 
          />
        </div>

        <ErrorBoundary>
          <LoadingProvider>
            <JWTAuthProvider>
              <AccessibilityProvider>
                {/* Activity Heartbeat - keeps user active in analytics */}
                <ActivityHeartbeat />
                
                <NavigationWrapper>
                  {/* Skip to main content link for screen readers */}
                  <a href="#main-content" className="skip-to-main">
                    Skip to main content
                  </a>

                  {/* Offline Indicator */}
                  <OfflineIndicator />

                  {/* Main Content */}
                  <main id="main-content">
                    {children}
                  </main>

                  {/* Accessibility Panel */}
                  <AccessibilityPanel />

                  {/* Global Loading Overlay */}
                  <LoadingOverlay />
                </NavigationWrapper>
              </AccessibilityProvider>
            </JWTAuthProvider>
          </LoadingProvider>
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
