import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { VaultProvider } from '@/components/vault/VaultContext'
import { SearchProvider } from '@/components/search/SearchContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Space',
  description: 'Your personal knowledge base',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0d0d1a] text-white antialiased`}>
        <SessionProvider>
          <VaultProvider>
            <SearchProvider>
              {children}
            </SearchProvider>
          </VaultProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
