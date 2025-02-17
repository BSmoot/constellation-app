// src/app/layout.tsx
import '@/app/globals.css'
import { plusJakarta, outfit } from '@/config'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable}`}>
      <body className="bg-white">{children}</body>
    </html>
  )
}