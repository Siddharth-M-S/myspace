'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { EntryViewer } from '@/components/entry/EntryViewer'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

interface SharedEntry {
  title: string
  content: string
  createdAt: string
  tags: string[]
}

export default function SharedEntryPage() {
  const params = useParams()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [entry, setEntry] = useState<SharedEntry | null>(null)

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(`/api/share/${params.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      const data = await res.json()
      setEntry(data.entry)
    } else {
      setError('Invalid password or expired link')
    }
  }

  if (entry) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-violet-400 text-lg">✦</span>
            <span className="font-bold text-white">My Space</span>
            <span className="text-xs text-gray-500 ml-2">— shared entry</span>
          </div>
          <div className="border-t border-white/10 my-4" />
          <h1 className="text-3xl font-bold text-white mb-2">{entry.title}</h1>
          <p className="text-sm text-gray-400 mb-6">{new Date(entry.createdAt).toLocaleDateString()}</p>
          <EntryViewer content={entry.content} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>
      <GlassCard className="w-full max-w-sm p-8 relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-3">
            <Lock className="w-6 h-6 text-violet-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Protected Entry</h1>
          <p className="text-sm text-gray-400 mt-1">Enter the share password to view this entry</p>
        </div>
        <form onSubmit={handleUnlock} className="flex flex-col gap-3">
          <div className="relative">
            <input
              autoFocus
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Share password"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">View Entry</Button>
        </form>
        <p className="text-center text-xs text-gray-600 mt-4">Shared via My Space</p>
      </GlassCard>
    </div>
  )
}
