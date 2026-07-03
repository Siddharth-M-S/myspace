/**
 * Run this script ONCE after deploying to create the first admin user.
 * Usage: node scripts/seed-admin.mjs
 * 
 * Requires env vars to be set first.
 */

import { Redis } from '@upstash/redis'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const username = process.env.ADMIN_USERNAME || 'admin'
const password = process.env.ADMIN_PASSWORD || 'changeme123'

async function seed() {
  // Check if admin already exists
  const existingId = await redis.get(`username:${username.toLowerCase()}`)
  if (existingId) {
    console.log(`User "${username}" already exists. Skipping.`)
    process.exit(0)
  }

  const id = randomUUID()
  const hashedPassword = await bcrypt.hash(password, 12)
  const now = new Date().toISOString()

  const user = { id, username, hashedPassword, role: 'admin', createdAt: now, updatedAt: now }

  await redis.hset(`user:${id}`, user)
  await redis.set(`username:${username.toLowerCase()}`, id)
  await redis.sadd('users:index', id)

  console.log(`✓ Admin user created: "${username}"`)
  console.log(`  Password: ${password}`)
  console.log(`  Remember to change the password after first login!`)
}

seed().catch(console.error)
