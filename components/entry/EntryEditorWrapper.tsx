'use client'

import { EntryEditor } from './EntryEditor'
import type { Section } from '@/types'

interface EntryEditorWrapperProps {
  sections: Section[]
  initialSectionId?: string
  initialData?: {
    id?: string
    title?: string
    content?: string
    tags?: string[]
    source?: string
    sectionId?: string
  }
}

export function EntryEditorWrapper({ sections, initialSectionId, initialData }: EntryEditorWrapperProps) {
  return (
    <EntryEditor
      sections={sections}
      initialData={initialData || (initialSectionId ? { sectionId: initialSectionId } : undefined)}
    />
  )
}
