import { redis } from './redis'
import { v4 as uuidv4 } from 'uuid'
import type { Section } from '@/types'

const DEFAULT_SECTIONS = [
  { name: 'Work', order: 0 },
  { name: 'Learning', order: 1 },
  { name: 'Ideas', order: 2 },
  { name: 'Diary', order: 3 },
  { name: 'Snippets', order: 4 },
]

export async function getSectionsForUser(userId: string): Promise<Section[]> {
  const ids = await redis.smembers<string[]>(`sections:${userId}`)
  if (!ids || ids.length === 0) return []
  const sections = await Promise.all(ids.map((id) => redis.hgetall(`section:${id}`) as Promise<Section | null>))
  return (sections.filter(Boolean) as Section[]).sort((a, b) => a.order - b.order)
}

export async function getSectionById(id: string): Promise<Section | null> {
  const section = await redis.hgetall(`section:${id}`) as Section | null
  if (!section || !section.id) return null
  return section
}

export async function createSection(
  userId: string,
  name: string,
  isVault = false
): Promise<Section> {
  const id = uuidv4()
  const existingSections = await getSectionsForUser(userId)
  const order = existingSections.length

  const section: Section = {
    id,
    name,
    userId,
    order,
    isVault,
    createdAt: new Date().toISOString(),
  }

  await redis.hset(`section:${id}`, section as unknown as Record<string, unknown>)
  await redis.sadd(`sections:${userId}`, id)

  return section
}

export async function updateSection(
  id: string,
  updates: Partial<Pick<Section, 'name' | 'order'>>
): Promise<Section | null> {
  const section = await getSectionById(id)
  if (!section) return null
  const updated = { ...section, ...updates }
  await redis.hset(`section:${id}`, updated as unknown as Record<string, unknown>)
  return updated
}

export async function deleteSection(id: string, userId: string): Promise<void> {
  const section = await getSectionById(id)
  if (!section || section.isVault) return // can't delete vault
  await redis.del(`section:${id}`)
  await redis.srem(`sections:${userId}`, id)
  // also delete all entries in this section
  const entryIds = await redis.smembers<string[]>(`entries:${id}`)
  if (entryIds && entryIds.length > 0) {
    await Promise.all(entryIds.map((eid) => redis.del(`entry:${eid}`)))
    await redis.del(`entries:${id}`)
  }
}

export async function seedDefaultSections(userId: string): Promise<void> {
  const existing = await getSectionsForUser(userId)
  if (existing.length > 0) return

  for (const s of DEFAULT_SECTIONS) {
    await createSection(userId, s.name, false)
  }
  // create vault last
  await createSection(userId, 'Vault', true)
}
