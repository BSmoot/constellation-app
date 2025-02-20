// src/app/layout.tsx

import { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Constellation App',
  description: 'Map your generational experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Remove any manual preload links if they exist */}
      </head>
      <body className={jakarta.className}>
        {children}
      </body>
    </html>
  )
}