'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, X } from 'lucide-react'
import { useSearchModal } from './SearchContext'
import { useVault } from '@/components/vault/VaultContext'
import { formatDate } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  excerpt: string
  sectionName: string
  createdAt: string
  isVault: boolean
}

export function SearchModal() {
  const { isOpen, closeSearch } = useSearchModal()
  const { vaultUnlocked } = useVault()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) closeSearch()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, closeSearch])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&vault=${vaultUnlocked}`)
    const data = await res.json()
    setResults(data.results || [])
    setSelected(0)
    setLoading(false)
  }, [vaultUnlocked])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(t)
  }, [query, doSearch])

  useEffect(() => {
    if (!isOpen) { setQuery(''); setResults([]) }
  }, [isOpen])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) {
      router.push(`/entry/${results[selected].id}`)
      closeSearch()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSearch} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d0d1a]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search your notes..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 rounded text-xs bg-white/5 border border-white/10 text-gray-500">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-gray-500">
              <Search className="w-8 h-8 opacity-30" />
              <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}
          {!loading && results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => { router.push(`/entry/${r.id}`); closeSearch() }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0 ${i === selected ? 'bg-violet-600/20' : 'hover:bg-white/5'}`}
            >
              <FileText className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{r.title}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{r.excerpt}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-violet-400">{r.sectionName}</p>
                <p className="text-xs text-gray-600 mt-0.5">{formatDate(r.createdAt)}</p>
              </div>
            </button>
          ))}
          {!query && (
            <div className="flex flex-col items-center gap-2 py-10 text-gray-600">
              <Search className="w-8 h-8 opacity-30" />
              <p className="text-sm">Start typing to search your notes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
