import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import type { ShareLink } from '@/types'

export async function createShareLink(
  entryId: string,
  password: string
): Promise<ShareLink> {
  const token = uuidv4()
  const hashedPassword = await bcrypt.hash(password, 10)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  const link: ShareLink = {
    token,
    entryId,
    hashedPassword,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  await redis.hset(`share:${token}`, link as unknown as Record<string, unknown>)
  await redis.expireat(`share:${token}`, Math.floor(expiresAt.getTime() / 1000))

  return link
}

export async function getShareLink(token: string): Promise<ShareLink | null> {
  const link = await redis.hgetall(`share:${token}`) as ShareLink | null
  if (!link || !link.token) return null
  return link
}

export async function verifySharePassword(token: string, password: string): Promise<boolean> {
  const link = await getShareLink(token)
  if (!link) return false
  if (new Date(link.expiresAt) < new Date()) return false
  return bcrypt.compare(password, link.hashedPassword)
}

export async function deleteShareLink(token: string): Promise<void> {
  await redis.del(`share:${token}`)
}
