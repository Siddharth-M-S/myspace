'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, FileSpreadsheet, File,
  Check, Loader2, X, FolderOpen, Image as ImageIcon,
  Film, Music, Archive
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import useSWR from 'swr'
import type { Section } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getFileIcon(fileName: string): { icon: React.ElementType; color: string; label: string } {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return { icon: FileText, color: 'text-red-400', label: 'PDF' }
  if (['doc', 'docx'].includes(ext)) return { icon: FileText, color: 'text-blue-400', label: 'Word' }
  if (['xls', 'xlsx'].includes(ext)) return { icon: FileSpreadsheet, color: 'text-green-400', label: 'Excel' }
  if (['csv'].includes(ext)) return { icon: FileSpreadsheet, color: 'text-green-300', label: 'CSV' }
  if (['ppt', 'pptx'].includes(ext)) return { icon: FileText, color: 'text-orange-400', label: 'PowerPoint' }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return { icon: ImageIcon, color: 'text-pink-400', label: 'Image' }
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return { icon: Film, color: 'text-purple-400', label: 'Video' }
  if (['mp3', 'wav', 'ogg'].includes(ext)) return { icon: Music, color: 'text-yellow-400', label: 'Audio' }
  if (['zip', 'rar', '7z'].includes(ext)) return { icon: Archive, color: 'text-gray-400', label: 'Archive' }
  if (['md', 'txt'].includes(ext)) return { icon: FileText, color: 'text-violet-400', label: 'Text' }
  return { icon: File, color: 'text-gray-400', label: ext.toUpperCase() || 'File' }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type FileStatus = 'pending' | 'uploading' | 'done' | 'error'

export default function UploadPage({ searchParams }: { searchParams: { section?: string } }) {
  const router = useRouter()
  const { data } = useSWR('/api/sections', fetcher)
  const sections: Section[] = data?.sections || []
  const normalSections = sections.filter((s) => !s.isVault)
  const vaultSection = sections.find((s) => s.isVault)

  const [files, setFiles] = useState<File[]>([])
  const [sectionId, setSectionId] = useState(searchParams.section || '')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Record<string, FileStatus>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const newFiles = Array.from(incoming).filter(
      (f) => !files.find((e) => e.name === f.name && e.size === f.size)
    )
    setFiles((prev) => [...prev, ...newFiles])
  }, [files])

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name))
    setStatus((prev) => { const n = { ...prev }; delete n[name]; return n })
    setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  async function handleUpload() {
    if (files.length === 0 || !sectionId) return
    setLoading(true)

    const init: Record<string, FileStatus> = {}
    files.forEach((f) => { init[f.name] = 'pending' })
    setStatus(init)

    let lastId = ''

    for (const file of files) {
      setStatus((prev) => ({ ...prev, [file.name]: 'uploading' }))

      try {
        const form = new FormData()
        form.append('file', file)
        form.append('sectionId', sectionId)

        const res = await fetch('/api/files', { method: 'POST', body: form })
        const data = await res.json()

        if (res.ok) {
          setStatus((prev) => ({ ...prev, [file.name]: 'done' }))
          lastId = data.entry?.id || ''
        } else {
          setStatus((prev) => ({ ...prev, [file.name]: 'error' }))
          setErrors((prev) => ({ ...prev, [file.name]: data.error || 'Upload failed' }))
        }
      } catch {
        setStatus((prev) => ({ ...prev, [file.name]: 'error' }))
        setErrors((prev) => ({ ...prev, [file.name]: 'Network error' }))
      }
    }

    setLoading(false)
    setTimeout(() => {
      router.push(lastId ? `/section/${sectionId}` : `/section/${sectionId}`)
    }, 800)
  }

  const allDone = files.length > 0 && files.every((f) => status[f.name] === 'done')
  const doneCount = files.filter((f) => status[f.name] === 'done').length

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-violet-400" />
          </div>
          Upload Files
        </h1>
        <p className="text-gray-400 text-sm mt-2 ml-[52px]">
          Upload any file — PDF, Word, Excel, images, videos and more. Open them anytime from your sections.
        </p>
      </div>

      {/* Supported badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: 'PDF', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
          { label: 'Word', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Excel', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
          { label: 'Images', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
          { label: 'PowerPoint', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
          { label: 'Videos', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
          { label: 'Any file', color: 'text-gray-400 bg-white/5 border-white/10' },
        ].map(({ label, color }) => (
          <span key={label} className={`px-2.5 py-0.5 rounded-full text-xs border font-medium ${color}`}>
            {label}
          </span>
        ))}
      </div>

      <GlassCard className="p-6 flex flex-col gap-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none
            ${dragOver
              ? 'border-violet-500 bg-violet-500/10'
              : 'border-white/10 hover:border-violet-500/40 hover:bg-white/[0.03]'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
            ${dragOver ? 'bg-violet-600/20 border border-violet-500/40' : 'bg-white/5 border border-white/10'}`}>
            <Upload className={`w-8 h-8 transition-colors ${dragOver ? 'text-violet-400' : 'text-gray-500'}`} />
          </div>
          <div className="text-center">
            <p className="text-white font-medium">
              {dragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-gray-500 text-sm mt-1">or click to browse your device</p>
            <p className="text-gray-600 text-xs mt-1">Max 25MB per file</p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            {files.map((file) => {
              const { icon: Icon, color, label } = getFileIcon(file.name)
              const s = status[file.name]
              const err = errors[file.name]
              return (
                <div
                  key={file.name}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                    ${s === 'done' ? 'bg-green-500/5 border-green-500/20' :
                      s === 'error' ? 'bg-red-500/5 border-red-500/20' :
                      s === 'uploading' ? 'bg-violet-500/5 border-violet-500/20' :
                      'bg-white/5 border-white/10'}`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{label} · {formatSize(file.size)}</p>
                    {err && <p className="text-xs text-red-400 mt-0.5">{err}</p>}
                  </div>
                  <div className="shrink-0">
                    {!s && (
                      <button onClick={(e) => { e.stopPropagation(); removeFile(file.name) }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {s === 'uploading' && <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />}
                    {s === 'done' && <Check className="w-5 h-5 text-green-400" />}
                    {s === 'error' && <X className="w-5 h-5 text-red-400" />}
                  </div>
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
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          >
            <option value="" className="bg-[#1a1a2e]">Choose a section...</option>
            {normalSections.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name}</option>
            ))}
            {vaultSection && (
              <option value={vaultSection.id} className="bg-[#1a1a2e]">🔒 Vault (private)</option>
            )}
          </select>
        </div>

        {/* Success */}
        {allDone && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <Check className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-sm text-green-400 font-medium">
              {doneCount} file{doneCount !== 1 ? 's' : ''} uploaded! Redirecting to section...
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="ghost" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            loading={loading}
            disabled={files.length === 0 || !sectionId || allDone}
            className="flex-1"
          >
            <Upload className="w-4 h-4" />
            {loading
              ? `Uploading ${doneCount}/${files.length}...`
              : `Upload ${files.length > 0 ? files.length + ' ' : ''}File${files.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
