import { auth } from '@/lib/auth'
import { createEntry } from '@/lib/entries'
import { getSectionsForUser } from '@/lib/sections'
import { NextResponse } from 'next/server'

// Max file size: 10MB
const MAX_SIZE = 10 * 1024 * 1024

function cleanTitle(filename: string): string {
  return filename
    .replace(/\.(pdf|docx?|xlsx?|csv|txt|md|markdown|pptx?)$/i, '')
    .replace(/[-_]/g, ' ')
    .trim()
}

async function extractText(file: File): Promise<{ content: string; tags: string[] }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const tags: string[] = ['imported']

  // Plain text / markdown
  if (['txt', 'md', 'markdown'].includes(ext)) {
    const text = await file.text()
    tags.push(ext === 'txt' ? 'text' : 'markdown')
    return { content: text, tags }
  }

  // CSV — convert to markdown table
  if (ext === 'csv') {
    const text = await file.text()
    const lines = text.trim().split('\n')
    const rows = lines.map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')))
    let md = ''
    if (rows.length > 0) {
      md += '| ' + rows[0].join(' | ') + ' |\n'
      md += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n'
      rows.slice(1).forEach((row) => { md += '| ' + row.join(' | ') + ' |\n' })
    }
    tags.push('csv', 'table')
    return { content: md, tags }
  }

  // PDF
  if (ext === 'pdf') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const buffer = Buffer.from(await file.arrayBuffer())
      const data = await pdfParse(buffer)
      const content = `## ${cleanTitle(file.name)}\n\n${data.text.trim()}`
      tags.push('pdf')
      return { content, tags }
    } catch {
      return {
        content: `## ${cleanTitle(file.name)}\n\n> PDF parsing failed. File was saved as reference.\n\n_File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)_`,
        tags: [...tags, 'pdf']
      }
    }
  }

  // DOCX / DOC
  if (['docx', 'doc'].includes(ext)) {
    try {
      const mammoth = (await import('mammoth'))
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await mammoth.extractRawText({ buffer })
      const content = `## ${cleanTitle(file.name)}\n\n${result.value.trim()}`
      tags.push('word', 'docx')
      return { content, tags }
    } catch {
      return {
        content: `## ${cleanTitle(file.name)}\n\n> Word document parsing failed. File was saved as reference.\n\n_File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)_`,
        tags: [...tags, 'word']
      }
    }
  }

  // XLSX / XLS — convert sheets to markdown tables
  if (['xlsx', 'xls'].includes(ext)) {
    try {
      const XLSX = (await import('xlsx'))
      const buffer = Buffer.from(await file.arrayBuffer())
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      let content = `## ${cleanTitle(file.name)}\n\n`

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName]
        const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][]
        if (rows.length === 0) return

        content += `### ${sheetName}\n\n`
        if (rows[0]) {
          content += '| ' + rows[0].join(' | ') + ' |\n'
          content += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n'
          rows.slice(1).forEach((row) => {
            content += '| ' + row.map((c) => String(c ?? '')).join(' | ') + ' |\n'
          })
        }
        content += '\n'
      })

      tags.push('excel', 'spreadsheet')
      return { content, tags }
    } catch {
      return {
        content: `## ${cleanTitle(file.name)}\n\n> Excel parsing failed. File was saved as reference.\n\n_File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)_`,
        tags: [...tags, 'excel']
      }
    }
  }

  // PowerPoint — extract as plain note
  if (['pptx', 'ppt'].includes(ext)) {
    return {
      content: `## ${cleanTitle(file.name)}\n\n> PowerPoint file uploaded. Content preview not available.\n\n_File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)_`,
      tags: [...tags, 'powerpoint', 'slides']
    }
  }

  // Fallback for unknown types
  try {
    const text = await file.text()
    return { content: text, tags }
  } catch {
    return {
      content: `## ${cleanTitle(file.name)}\n\n> File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      tags
    }
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const sectionId = formData.get('sectionId') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

  // Verify section belongs to user
  const sections = await getSectionsForUser(session.user.id)
  const section = sections.find((s) => s.id === sectionId)
  if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 })

  const title = cleanTitle(file.name)
  const { content, tags } = await extractText(file)

  const entry = await createEntry({
    title,
    content,
    tags,
    source: `imported: ${file.name}`,
    sectionId,
    userId: session.user.id,
    isVault: section.isVault,
  })

  return NextResponse.json({ entry })
}
