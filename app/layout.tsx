import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import PwaRegister from '@/components/PwaRegister'
import './globals.css'

export const metadata: Metadata = {
  title: 'WhatsOmm — Perception Reports',
  description: 'Observational perception reports for Extended Avatar conversations. A ONIOKO product.',
  applicationName: 'WhatsOmm',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'WhatsOmm' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-512-maskable.png' },
}

export const viewport: Viewport = {
  themeColor: '#080b11',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
