'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Check } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import useSWR from 'swr'
import type { Section } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ImportPage() {
  const router = useRouter()
  const { data } = useSWR('/api/sections', fetcher)
  const sections: Section[] = data?.sections?.filter((s: Section) => !s.isVault) || []

  const [file, setFile] = useState<File | null>(null)
  const [sectionId, setSectionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleImport() {
    if (!file || !sectionId) { setError('Select a file and section'); return }
    setError('')
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('sectionId', sectionId)

    const res = await fetch('/api/import', { method: 'POST', body: formData })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push(`/entry/${data.entry.id}`), 1000)
    } else {
      setError(data.error || 'Import failed')
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Upload className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Import Markdown File</h1>
            <p className="text-sm text-gray-400">Upload a .md file and save it as an entry</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* File drop zone */}
          <label className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${file ? 'border-violet-500/50 bg-violet-600/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
            <input
              type="file"
              accept=".md,.markdown,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <>
                <FileText className="w-8 h-8 text-violet-400" />
                <p className="text-sm text-violet-300 font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-500" />
                <p className="text-sm text-gray-400">Click to select a .md file</p>
                <p className="text-xs text-gray-600">Supports .md, .markdown, .txt</p>
              </>
            )}
          </label>

          {/* Section picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Save to Section</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="" className="bg-[#1a1a2e]">Select section...</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Check className="w-4 h-4 text-green-400" />
              <p className="text-sm text-green-400">Imported! Redirecting...</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleImport} loading={loading} disabled={!file || !sectionId} className="flex-1">
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
