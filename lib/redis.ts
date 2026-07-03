import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Upstash Redis env vars not configured. See .env.local.example')
    }
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return _redis
}

// Lazy proxy — only connects to Redis when a method is called
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const r = getRedis()
    const val = (r as unknown as Record<string, unknown>)[prop as string]
    if (typeof val === 'function') {
      return val.bind(r)
    }
    return val
  },
})

export default redis
