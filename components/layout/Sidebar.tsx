'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  BookOpen, Lightbulb, BookMarked, Code2, Briefcase,
  Plus, Lock, ChevronRight, Trash2, Pencil, Check, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Section } from '@/types'
import { useVault } from '@/components/vault/VaultContext'

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Work: <Briefcase className="w-4 h-4" />,
  Learning: <BookOpen className="w-4 h-4" />,
  Ideas: <Lightbulb className="w-4 h-4" />,
  Diary: <BookMarked className="w-4 h-4" />,
  Snippets: <Code2 className="w-4 h-4" />,
  Vault: <Lock className="w-4 h-4" />,
}

interface SidebarProps {
  sections: Section[]
  onSectionCreated: () => void
  onSectionDeleted: (id: string) => void
  onSectionRenamed: (id: string, name: string) => void
}

export function Sidebar({ sections, onSectionCreated, onSectionDeleted, onSectionRenamed }: SidebarProps) {
  const pathname = usePathname()
  const { vaultUnlocked, openVaultUnlock } = useVault()
  const [creatingSection, setCreatingSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [creating, setCreating] = useState(false)

  const normalSections = sections.filter((s) => !s.isVault)
  const vaultSection = sections.find((s) => s.isVault)

  async function handleCreateSection() {
    if (!newSectionName.trim()) return
    setCreating(true)
    await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSectionName.trim() }),
    })
    setNewSectionName('')
    setCreatingSection(false)
    setCreating(false)
    onSectionCreated()
  }

  async function handleRename(id: string) {
    if (!renameValue.trim()) return
    await fetch(`/api/sections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameValue.trim() }),
    })
    setRenamingId(null)
    onSectionRenamed(id, renameValue.trim())
  }

  async function handleDelete(id: string) {
    await fetch(`/api/sections/${id}`, { method: 'DELETE' })
    onSectionDeleted(id)
  }

  function SectionItem({ section }: { section: Section }) {
    const isActive = pathname === `/section/${section.id}`
    const isVault = section.isVault
    const isRenaming = renamingId === section.id

    if (isVault && !vaultUnlocked) {
      return (
        <button
          onClick={openVaultUnlock}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-200 group"
        >
          <Lock className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400" />
          <span className="flex-1 text-left">Vault</span>
          <div className="w-2 h-2 rounded-full bg-amber-500/40 group-hover:bg-amber-400" />
        </button>
      )
    }

    if (isRenaming) {
      return (
        <div className="flex items-center gap-1 px-2 py-1.5">
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename(section.id)
              if (e.key === 'Escape') setRenamingId(null)
            }}
            className="flex-1 bg-white/10 rounded px-2 py-1 text-sm text-white outline-none border border-violet-500/50"
          />
          <button onClick={() => handleRename(section.id)} className="text-green-400 hover:text-green-300 p-0.5">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setRenamingId(null)} className="text-gray-400 hover:text-gray-200 p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }

    return (
      <div className={cn('group flex items-center gap-2 rounded-lg transition-all duration-200', isActive && 'bg-violet-600/20 border border-violet-500/30')}>
        <Link
          href={`/section/${section.id}`}
          className={cn(
            'flex-1 flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors',
            isActive ? 'text-violet-300' : 'text-gray-400 hover:text-gray-100',
            isVault && vaultUnlocked && 'text-amber-300'
          )}
        >
          <span className={cn(isActive ? 'text-violet-400' : 'text-gray-500', isVault && vaultUnlocked && 'text-amber-400')}>
            {SECTION_ICONS[section.name] || <ChevronRight className="w-4 h-4" />}
          </span>
          <span className="flex-1 truncate">{section.name}</span>
          {isVault && vaultUnlocked && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
        </Link>
        {!isVault && (
          <div className="hidden group-hover:flex items-center gap-1 pr-2">
            <button
              onClick={() => { setRenamingId(section.id); setRenameValue(section.name) }}
              className="text-gray-500 hover:text-gray-300 p-0.5 rounded"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDelete(section.id)}
              className="text-gray-500 hover:text-red-400 p-0.5 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 min-h-screen border-r border-white/10 bg-white/[0.02] flex flex-col">
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
          Sections
        </p>

        <nav className="flex flex-col gap-0.5">
          {normalSections.map((section) => (
            <SectionItem key={section.id} section={section} />
          ))}

          {/* Divider before vault */}
          <div className="my-2 border-t border-white/5" />

          {vaultSection && <SectionItem key={vaultSection.id} section={vaultSection} />}
        </nav>

        {/* Create section */}
        <div className="mt-4">
          {creatingSection ? (
            <div className="flex flex-col gap-2 px-1">
              <input
                autoFocus
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSection()
                  if (e.key === 'Escape') { setCreatingSection(false); setNewSectionName('') }
                }}
                placeholder="Section name..."
                className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 border border-white/10 focus:border-violet-500/50 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateSection}
                  disabled={creating || !newSectionName.trim()}
                  className="flex-1 text-xs py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-500 text-white transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => { setCreatingSection(false); setNewSectionName('') }}
                  className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreatingSection(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Section
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
