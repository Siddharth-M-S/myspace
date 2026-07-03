import { redis } from './redis'
import { v4 as uuidv4 } from 'uuid'
import type { Entry } from '@/types'

export async function getEntriesForSection(sectionId: string): Promise<Entry[]> {
  const ids = await redis.smembers<string[]>(`entries:${sectionId}`)
  if (!ids || ids.length === 0) return []
  const entries = await Promise.all(ids.map((id) => redis.hgetall(`entry:${id}`) as Promise<Entry | null>))
  const valid = entries.filter(Boolean) as Entry[]
  return valid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getEntryById(id: string): Promise<Entry | null> {
  const entry = await redis.hgetall(`entry:${id}`) as Entry | null
  if (!entry || !entry.id) return null
  // parse tags if stored as string
  if (typeof entry.tags === 'string') {
    try { entry.tags = JSON.parse(entry.tags) } catch { entry.tags = [] }
  }
  return entry
}

export async function getRecentEntries(userId: string, limit = 10): Promise<Entry[]> {
  // Get all sections for user then pull recent entries
  const sectionIds = await redis.smembers<string[]>(`sections:${userId}`)
  if (!sectionIds || sectionIds.length === 0) return []

  const allEntries: Entry[] = []
  for (const sid of sectionIds) {
    const ids = await redis.smembers<string[]>(`entries:${sid}`)
    if (!ids || ids.length === 0) continue
  const entries = await Promise.all(ids.map((id) => redis.hgetall(`entry:${id}`) as Promise<Entry | null>))
    allEntries.push(...(entries.filter(Boolean) as Entry[]))
  }

  return allEntries
    .filter((e) => !e.isVault)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export async function createEntry(data: {
  title: string
  content: string
  tags: string[]
  source: string
  sectionId: string
  userId: string
  isVault: boolean
}): Promise<Entry> {
  const id = uuidv4()
  const now = new Date().toISOString()

  const entry: Entry = {
    id,
    title: data.title || `Note — ${new Date().toLocaleDateString()}`,
    content: data.content,
    tags: data.tags,
    source: data.source,
    sectionId: data.sectionId,
    userId: data.userId,
    isVault: data.isVault,
    createdAt: now,
    updatedAt: now,
  }

  const toStore = { ...entry, tags: JSON.stringify(entry.tags) }
  await redis.hset(`entry:${id}`, toStore as unknown as Record<string, unknown>)
  await redis.sadd(`entries:${data.sectionId}`, id)
  // also track in user-level index for search
  await redis.sadd(`user-entries:${data.userId}`, id)

  return entry
}

export async function updateEntry(
  id: string,
  updates: Partial<Pick<Entry, 'title' | 'content' | 'tags' | 'source'>>
): Promise<Entry | null> {
  const entry = await getEntryById(id)
  if (!entry) return null

  const updated: Entry = {
    ...entry,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  const toStore = { ...updated, tags: JSON.stringify(updated.tags) }
  await redis.hset(`entry:${id}`, toStore as unknown as Record<string, unknown>)
  return updated
}

export async function deleteEntry(id: string): Promise<void> {
  const entry = await getEntryById(id)
  if (!entry) return
  await redis.del(`entry:${id}`)
  await redis.srem(`entries:${entry.sectionId}`, id)
  await redis.srem(`user-entries:${entry.userId}`, id)
}

export async function getAllEntriesForUser(userId: string): Promise<Entry[]> {
  const ids = await redis.smembers<string[]>(`user-entries:${userId}`)
  if (!ids || ids.length === 0) return []
  const entries = await Promise.all(ids.map((id) => getEntryById(id)))
  return entries.filter(Boolean) as Entry[]
}
