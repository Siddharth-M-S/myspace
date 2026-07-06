'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, FileSpreadsheet, Presentation,
  File, Check, Loader2, X, FolderOpen
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import useSWR from 'swr'
import type { Section } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ACCEPTED = [
  '.md', '.markdown', '.txt',
  '.pdf',
  '.doc', '.docx',
  '.xls', '.xlsx',
  '.csv',
  '.ppt', '.pptx',
]

const FILE_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pdf:      { icon: FileText,        color: 'text-red-400',    label: 'PDF' },
  doc:      { icon: FileText,        color: 'text-blue-400',   label: 'Word' },
  docx:     { icon: FileText,        color: 'text-blue-400',   label: 'Word' },
  xls:      { icon: FileSpreadsheet, color: 'text-green-400',  label: 'Excel' },
  xlsx:     { icon: FileSpreadsheet, color: 'text-green-400',  label: 'Excel' },
  csv:      { icon: FileSpreadsheet, color: 'text-green-300',  label: 'CSV' },
  ppt:      { icon: Presentation,    color: 'text-orange-400', label: 'PowerPoint' },
  pptx:     { icon: Presentation,    color: 'text-orange-400', label: 'PowerPoint' },
  md:       { icon: FileText,        color: 'text-violet-400', label: 'Markdown' },
  markdown: { icon: FileText,        color: 'text-violet-400', label: 'Markdown' },
  txt:      { icon: FileText,        color: 'text-gray-400',   label: 'Text' },
}

function getFileInfo(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return FILE_ICONS[ext] ?? { icon: File, color: 'text-gray-400', label: ext.toUpperCase() }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ImportPage() {
  const router = useRouter()
  const { data } = useSWR('/api/sections', fetcher)
  const sections: Section[] = data?.sections?.filter((s: Section) => !s.isVault) || []

  const [files, setFiles] = useState<File[]>([])
  const [sectionId, setSectionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<Record<string, 'pending' | 'uploading' | 'done' | 'error'>>({})
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const newFiles = Array.from(incoming).filter(
      (f) => !files.find((existing) => existing.name === f.name)
    )
    setFiles((prev) => [...prev, ...newFiles])
  }, [files])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name))
    setProgress((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  async function handleImport() {
    if (files.length === 0 || !sectionId) {
      setError('Select at least one file and a section')
      return
    }
    setError('')
    setLoading(true)

    const initial: Record<string, 'pending'> = {}
    files.forEach((f) => { initial[f.name] = 'pending' })
    setProgress(initial)

    let lastEntryId = ''

    for (const file of files) {
      setProgress((prev) => ({ ...prev, [file.name]: 'uploading' }))

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('sectionId', sectionId)

        const res = await fetch('/api/import', { method: 'POST', body: formData })
        const data = await res.json()

        if (res.ok) {
          setProgress((prev) => ({ ...prev, [file.name]: 'done' }))
          lastEntryId = data.entry.id
        } else {
          setProgress((prev) => ({ ...prev, [file.name]: 'error' }))
        }
      } catch {
        setProgress((prev) => ({ ...prev, [file.name]: 'error' }))
      }
    }

    setLoading(false)

    // Navigate to last imported entry or section
    setTimeout(() => {
      if (lastEntryId) router.push(`/entry/${lastEntryId}`)
      else router.push(`/section/${sectionId}`)
    }, 800)
  }

  const allDone = files.length > 0 && files.every((f) => progress[f.name] === 'done')

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Upload className="w-5 h-5 text-violet-400" />
          </div>
          Import Files
        </h1>
        <p className="text-sm text-gray-400 mt-2 ml-13">
          Upload any document — it gets extracted and saved as a readable note
        </p>
      </div>

      {/* Supported formats */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: 'PDF', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
          { label: 'Word .docx', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { label: 'Excel .xlsx', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
          { label: 'CSV', color: 'bg-green-500/10 text-green-300 border-green-500/20' },
          { label: 'PowerPoint', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
          { label: 'Markdown', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
          { label: 'Text .txt', color: 'bg-white/5 text-gray-400 border-white/10' },
        ].map(({ label, color }) => (
          <span key={label} className={`px-2 py-0.5 rounded text-xs border ${color}`}>{label}</span>
        ))}
      </div>

      <GlassCard className="p-6 flex flex-col gap-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
            ${dragOver
              ? 'border-violet-500 bg-violet-500/10 scale-[1.01]'
              : 'border-white/10 hover:border-violet-500/50 hover:bg-white/5'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
            <Upload className={`w-7 h-7 transition-colors ${dragOver ? 'text-violet-400' : 'text-gray-500'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-300">
              {dragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-gray-500 mt-1">or click to browse — max 10MB per file</p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
            {files.map((file) => {
              const { icon: Icon, color, label } = getFileInfo(file.name)
              const status = progress[file.name]
              return (
                <div key={file.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{label} · {formatSize(file.size)}</p>
                  </div>
                  {/* Status */}
                  {!status && (
                    <button onClick={(e) => { e.stopPropagation(); removeFile(file.name) }}
                      className="text-gray-600 hover:text-gray-300 transition-colors p-1">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {status === 'uploading' && (
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
                  )}
                  {status === 'done' && (
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                  )}
                  {status === 'error' && (
                    <span className="text-xs text-red-400 shrink-0">Failed</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Section picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-violet-400" />
            Save to Section
          </label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          >
            <option value="" className="bg-[#1a1a2e]">Select section...</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-2">
            <X className="w-4 h-4" /> {error}
          </p>
        )}

        {allDone && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <Check className="w-4 h-4 text-green-400 shrink-0" />
            <p className="text-sm text-green-400">
              All files imported! Redirecting...
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            loading={loading}
            disabled={files.length === 0 || !sectionId || allDone}
            className="flex-1"
          >
            <Upload className="w-4 h-4" />
            {loading
              ? `Importing ${files.filter(f => progress[f.name] === 'done').length}/${files.length}...`
              : `Import ${files.length > 0 ? files.length + ' ' : ''}File${files.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </GlassCard>

      {/* Info box */}
      <div className="mt-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-400 font-medium">How it works:</span> PDF, Word, and Excel files are
          parsed and their text content is extracted into a readable Markdown note.
          CSV files become formatted tables. You can search, edit, and revisit them anytime.
        </p>
      </div>
    </div>
  )
}
