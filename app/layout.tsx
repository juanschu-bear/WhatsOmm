import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'
import PwaRegister from '@/components/PwaRegister'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

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
    <html lang="de" className={`${inter.variable} ${cormorant.variable} ${mono.variable}`}>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
