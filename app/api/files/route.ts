import { auth } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { getSectionsForUser } from '@/lib/sections'
import { redis } from '@/lib/redis'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import type { Entry } from '@/types'

const MAX_SIZE = 25 * 1024 * 1024 // 25MB

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const sectionId = formData.get('sectionId') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
  if (!sectionId) return NextResponse.json({ error: 'sectionId required' }, { status: 400 })

  // verify section belongs to user
  const sections = await getSectionsForUser(session.user.id)
  const section = sections.find((s) => s.id === sectionId)
  if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 })

  // upload to cloudinary
  const buffer = Buffer.from(await file.arrayBuffer())
  const { url, publicId } = await uploadToCloudinary(buffer, file.name, 'myspace')

  // store in redis as file entry
  const id = uuidv4()
  const now = new Date().toISOString()

  const entry: Entry = {
    id,
    type: 'file',
    title: file.name,
    content: '',
    tags: ['file'],
    source: 'uploaded file',
    sectionId,
    userId: session.user.id,
    isVault: section.isVault,
    fileUrl: url,
    filePublicId: publicId,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    createdAt: now,
    updatedAt: now,
  }

  const toStore = { ...entry, tags: JSON.stringify(entry.tags) }
  await redis.hset(`entry:${id}`, toStore as unknown as Record<string, unknown>)
  await redis.sadd(`entries:${sectionId}`, id)
  await redis.sadd(`user-entries:${session.user.id}`, id)

  return NextResponse.json({ entry })
}
