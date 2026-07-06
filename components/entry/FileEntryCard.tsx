'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, FileSpreadsheet, File, Image as ImageIcon,
  Film, Music, Archive, Download, ExternalLink, Trash2, Loader2
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatRelative } from '@/lib/utils'
import type { Entry } from '@/types'

function getFileIcon(fileName: string, fileType: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf' || fileType.includes('pdf'))
    return { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'PDF' }
  if (['doc', 'docx'].includes(ext) || fileType.includes('word'))
    return { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Word' }
  if (['xls', 'xlsx'].includes(ext) || fileType.includes('spreadsheet'))
    return { icon: FileSpreadsheet, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Excel' }
  if (ext === 'csv')
    return { icon: FileSpreadsheet, color: 'text-green-300', bg: 'bg-green-500/10 border-green-500/20', label: 'CSV' }
  if (['ppt', 'pptx'].includes(ext))
    return { icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'PPT' }
  if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
    return { icon: ImageIcon, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', label: 'Image' }
  if (fileType.startsWith('video/') || ['mp4', 'mov', 'avi'].includes(ext))
    return { icon: Film, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', label: 'Video' }
  if (fileType.startsWith('audio/') || ['mp3', 'wav'].includes(ext))
    return { icon: Music, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'Audio' }
  if (['zip', 'rar', '7z'].includes(ext))
    return { icon: Archive, color: 'text-gray-400', bg: 'bg-white/5 border-white/10', label: 'Archive' }
  return { icon: File, color: 'text-gray-400', bg: 'bg-white/5 border-white/10', label: ext.toUpperCase() || 'File' }
}

function formatSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function canOpenInBrowser(fileName: string, fileType: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return (
    ext === 'pdf' ||
    fileType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'mp3', 'wav'].includes(ext)
  )
}

interface FileEntryCardProps {
  entry: Entry
  sectionName?: string
  onDeleted?: () => void
}

export function FileEntryCard({ entry, sectionName, onDeleted }: FileEntryCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const fileName = entry.fileName || entry.title
  const fileType = entry.fileType || ''
  const { icon: Icon, color, bg, label } = getFileIcon(fileName, fileType)
  const openable = canOpenInBrowser(fileName, fileType)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/files/${entry.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (onDeleted) onDeleted()
    else router.refresh()
  }

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (entry.fileUrl) window.open(entry.fileUrl, '_blank')
  }

  function handleDownload(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!entry.fileUrl) return
    const a = document.createElement('a')
    a.href = entry.fileUrl
    a.download = fileName
    a.target = '_blank'
    a.click()
  }

  return (
    <GlassCard className="p-4 flex flex-col gap-3">
      {/* File info */}
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate leading-tight">{fileName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-medium ${color}`}>{label}</span>
            {entry.fileSize && (
              <span className="text-xs text-gray-500">· {formatSize(entry.fileSize)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {sectionName && <span className="text-violet-400/70">{sectionName}</span>}
        </div>
        <span>{formatRelative(entry.createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-white/5">
        {openable ? (
          <button
            onClick={handleOpen}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-violet-300 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </button>
        ) : (
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-blue-300 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        )}
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-red-400 bg-red-500/5 hover:bg-red-500/15 border border-red-500/20 transition-colors disabled:opacity-50"
          title="Delete"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </GlassCard>
  )
}
