import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Quiniela Mundial 2026 — Proyelec',
  description: 'Quiniela interna del Mundial USA/MEX/CAN 2026 · Proyelec International',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans bg-white text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
