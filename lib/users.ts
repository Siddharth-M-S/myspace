import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import type { User, UserRole } from '@/types'

export async function getUserById(id: string): Promise<User | null> {
  const user = await redis.hgetall(`user:${id}`) as User | null
  if (!user || !user.id) return null
  return user
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const id = await redis.get<string>(`username:${username.toLowerCase()}`)
  if (!id) return null
  return getUserById(id)
}

export async function getAllUsers(): Promise<User[]> {
  const ids = await redis.smembers<string[]>('users:index')
  if (!ids || ids.length === 0) return []
  const users = await Promise.all(ids.map((id) => getUserById(id)))
  return users.filter(Boolean) as User[]
}

export async function createUser(
  username: string,
  password: string,
  role: UserRole = 'user'
): Promise<User> {
  const existing = await getUserByUsername(username)
  if (existing) throw new Error('Username already exists')

  const id = uuidv4()
  const hashedPassword = await bcrypt.hash(password, 12)
  const now = new Date().toISOString()

  const user: User = {
    id,
    username,
    hashedPassword,
    role,
    createdAt: now,
    updatedAt: now,
  }

  await redis.hset(`user:${id}`, user as unknown as Record<string, unknown>)
  await redis.set(`username:${username.toLowerCase()}`, id)
  await redis.sadd('users:index', id)

  return user
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.hashedPassword)
}

export async function verifyVaultPassword(user: User, password: string): Promise<boolean> {
  if (!user.vaultHashedPassword) return false
  return bcrypt.compare(password, user.vaultHashedPassword)
}

export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await redis.hset(`user:${userId}`, {
    hashedPassword,
    updatedAt: new Date().toISOString(),
  })
}

export async function updateVaultPassword(userId: string, newPassword: string): Promise<void> {
  const vaultHashedPassword = await bcrypt.hash(newPassword, 12)
  await redis.hset(`user:${userId}`, {
    vaultHashedPassword,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteUser(userId: string): Promise<void> {
  const user = await getUserById(userId)
  if (!user) return
  await redis.del(`user:${userId}`)
  await redis.del(`username:${user.username.toLowerCase()}`)
  await redis.srem('users:index', userId)
}

export async function adminExists(): Promise<boolean> {
  const ids = await redis.smembers<string[]>('users:index')
  if (!ids || ids.length === 0) return false
  for (const id of ids) {
    const user = await getUserById(id)
    if (user?.role === 'admin') return true
  }
  return false
}
