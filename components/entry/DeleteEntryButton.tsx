'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteEntryButton({ entryId, sectionId }: { entryId: string; sectionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/entries/${entryId}`, { method: 'DELETE' })
    router.push(`/section/${sectionId}`)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
