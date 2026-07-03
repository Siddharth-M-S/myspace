'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { VaultUnlockModal } from '@/components/vault/VaultUnlockModal'
import { SearchModal } from '@/components/search/SearchModal'
import type { Section } from '@/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [sections, setSections] = useState<Section[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const fetchSections = useCallback(async () => {
    const res = await fetch('/api/sections')
    const data = await res.json()
    setSections(data.sections || [])
  }, [])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  if (!session) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Header username={session.user.username} role={session.user.role} />
      <div className="flex flex-1">
        {/* Sidebar — desktop */}
        <div className="hidden md:block">
          <Sidebar
            sections={sections}
            onSectionCreated={fetchSections}
            onSectionDeleted={(id) => setSections((s) => s.filter((x) => x.id !== id))}
            onSectionRenamed={(id, name) =>
              setSections((s) => s.map((x) => (x.id === id ? { ...x, name } : x)))
            }
          />
        </div>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="relative w-64 h-full">
              <Sidebar
                sections={sections}
                onSectionCreated={fetchSections}
                onSectionDeleted={(id) => setSections((s) => s.filter((x) => x.id !== id))}
                onSectionRenamed={(id, name) =>
                  setSections((s) => s.map((x) => (x.id === id ? { ...x, name } : x)))
                }
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <VaultUnlockModal />
      <SearchModal />
    </div>
  )
}
