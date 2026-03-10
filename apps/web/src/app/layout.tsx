import type { Metadata } from 'next'
import './globals.css'
import { SocketProvider } from '@/context/SocketContext'
import { JWTAuthProvider } from '@/context/JWTAuthContext'
import { UserProvider } from '@/context/UserContext'
import { DEFAULT_SEO } from '@/lib/seo'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import AnalyticsProvider from '@/components/AnalyticsProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { MobileNavigation } from '@/components/MobileNavigation'
import GlobalClickSpark from '@/components/GlobalClickSpark'

export const metadata: Metadata = {
  title: {
    default: DEFAULT_SEO.title,
    template: `%s | ${DEFAULT_SEO.siteName}`,
  },
  description: DEFAULT_SEO.description,
  keywords: DEFAULT_SEO.keywords.join(', '),
  authors: [{ name: DEFAULT_SEO.siteName }],
  creator: DEFAULT_SEO.siteName,
  publisher: DEFAULT_SEO.siteName,
  metadataBase: new URL(DEFAULT_SEO.url),
  
  openGraph: {
    type: 'website',
    locale: DEFAULT_SEO.locale,
    url: DEFAULT_SEO.url,
    siteName: DEFAULT_SEO.siteName,
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    images: [
      {
        url: DEFAULT_SEO.image,
        width: 1200,
        height: 630,
        alt: DEFAULT_SEO.siteName,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: DEFAULT_SEO.twitterHandle,
    creator: DEFAULT_SEO.twitterHandle,
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    images: [DEFAULT_SEO.image],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',

  appleWebApp: {
    capable: true,
    title: DEFAULT_SEO.siteName,
    statusBarStyle: 'default',
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={DEFAULT_SEO.url} />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <GoogleAnalytics />
        <GlobalClickSpark 
          sparkColor="#00E5FF"
          sparkCount={8}
          sparkRadius={15}
          sparkSize={13}
          duration={400}
          easing="ease-out"
        />
        <ErrorBoundary>
          <JWTAuthProvider>
            <UserProvider>
              <SocketProvider>
                <AnalyticsProvider>
                  {children}
                  <MobileNavigation />
                </AnalyticsProvider>
              </SocketProvider>
            </UserProvider>
          </JWTAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
