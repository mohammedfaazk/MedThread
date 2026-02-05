import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MedThread - Professional Medical Discussion Platform',
  description: 'Connect with verified healthcare professionals for trusted medical insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
