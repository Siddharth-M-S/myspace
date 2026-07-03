'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Section } from '@/types'
import dynamic from 'next/dynamic'

// Load editor client-side only (SSR issues with CodeMirror)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface EntryEditorProps {
  sections: Section[]
  initialData?: {
    id?: string
    title?: string
    content?: string
    tags?: string[]
    source?: string
    sectionId?: string
  }
}

export function EntryEditor({ sections, initialData }: EntryEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [source, setSource] = useState(initialData?.source || '')
  const [sectionId, setSectionId] = useState(initialData?.sectionId || sections[0]?.id || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!sectionId && sections.length > 0) setSectionId(sections[0].id)
  }, [sections, sectionId])

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  async function handleSave() {
    if (!sectionId) return
    setSaving(true)

    const isEdit = !!initialData?.id

    const res = await fetch(isEdit ? `/api/entries/${initialData.id}` : '/api/entries', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, tags, source, sectionId }),
    })

    const data = await res.json()
    setSaving(false)

    if (res.ok) {
      router.push(`/entry/${data.entry.id}`)
    }
  }

  const normalSections = sections.filter((s) => !s.isVault)
  const vaultSection = sections.find((s) => s.isVault)

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto p-6">
      {/* Title */}
      <Input
        placeholder="Entry title (optional — auto-generated if blank)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-medium"
      />

      {/* Section picker */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Section</label>
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        >
          {normalSections.map((s) => (
            <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name}</option>
          ))}
          {vaultSection && (
            <option key={vaultSection.id} value={vaultSection.id} className="bg-[#1a1a2e]">🔒 {vaultSection.name}</option>
          )}
        </select>
      </div>

      {/* Source */}
      <Input
        placeholder="Source (e.g. from Copilot, from YouTube video, from article...)"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-violet-600/20 text-violet-300 border border-violet-500/20">
              {tag}
              <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
            placeholder="Add tag and press Enter..."
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <button onClick={addTag} className="px-3 py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 text-sm">
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Markdown editor */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Content</label>
        <div data-color-mode="dark" className="rounded-xl overflow-hidden border border-white/10">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            height={500}
            preview="live"
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          {initialData?.id ? 'Update Entry' : 'Save Entry'}
        </Button>
      </div>
    </div>
  )
}
