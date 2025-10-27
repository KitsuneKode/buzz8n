import { logger } from '@/utils'
import { redis } from '@/redis'

export const WEBSOCKET_RATE_LIMITS = {
  maxConnectionsPerUser: 5,
  maxConnectionsPerIP: 10,
  maxMessagesPerMinute: 60,
  maxMessageSize: 100 * 1024, // 100KB
}

export interface WebSocketRateLimitResult {
  allowed: boolean
  reason?: string
}

class WebSocketRateLimiter {
  private redis = redis

  // Check if a new connection is allowed
  async checkConnectionAllowed(userId: string, ip: string): Promise<WebSocketRateLimitResult> {
    try {
      // Check user connections
      const userKey = `ws:user:${userId}`
      const userConnections = await redis.sCard(userKey)

      // Check IP connections
      const ipKey = `ws:ip:${ip}`
      const ipConnections = await redis.sCard(ipKey)

      if (userConnections >= WEBSOCKET_RATE_LIMITS.maxConnectionsPerUser) {
        return { allowed: false, reason: 'Too many connections for user' }
      }

      if (ipConnections >= WEBSOCKET_RATE_LIMITS.maxConnectionsPerIP) {
        return { allowed: false, reason: 'Too many connections from IP' }
      }

      return { allowed: true }
    } catch (error) {
      logger.error('WebSocket connection check failed', { userId, ip, error })
      return { allowed: true } // Fail open
    }
  }

  // Register a new connection
  async registerConnection(userId: string, ip: string, connectionId: string): Promise<void> {
    try {
      const userKey = `ws:user:${userId}`
      const ipKey = `ws:ip:${ip}`

      await redis.sAdd(userKey, connectionId)
      await redis.sAdd(ipKey, connectionId)
      await redis.expire(userKey, 3600) // 1 hour
      await redis.expire(ipKey, 3600)
    } catch (error) {
      logger.error('Failed to register WebSocket connection', { userId, ip, connectionId, error })
    }
  }

  // Check if a message is allowed
  async checkMessageAllowed(
    connectionId: string,
    messageSize: number,
  ): Promise<WebSocketRateLimitResult> {
    try {
      if (messageSize > WEBSOCKET_RATE_LIMITS.maxMessageSize) {
        return { allowed: false, reason: 'Message too large' }
      }

      const messageKey = `ws:msg:${connectionId}`
      const now = Date.now()
      const windowStart = now - 60 * 1000 // 1 minute

      // Clean old messages and count current
      await redis.zRemRangeByScore(messageKey, 0, windowStart)
      const messageCount = await redis.zCard(messageKey)

      if (messageCount >= WEBSOCKET_RATE_LIMITS.maxMessagesPerMinute) {
        return { allowed: false, reason: 'Too many messages' }
      }

      // Add current message
      await redis.zAdd(messageKey, now, `${now}-${Math.random()}`)
      await redis.expire(messageKey, 60)

      return { allowed: true }
    } catch (error) {
      logger.error('WebSocket message check failed', { connectionId, error })
      return { allowed: true } // Fail open
    }
  }

  // Unregister a connection
  async unregisterConnection(userId: string, ip: string, connectionId: string): Promise<void> {
    try {
      await redis.sRem(`ws:user:${userId}`, connectionId)
      await redis.sRem(`ws:ip:${ip}`, connectionId)
      await redis.del(`ws:msg:${connectionId}`)
    } catch (error) {
      logger.error('Failed to unregister WebSocket connection', { userId, ip, connectionId, error })
    }
  }
}

export const webSocketRateLimiter = new WebSocketRateLimiter()

// Utility functions
export function generateConnectionId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const host = req.headers.get('host')

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  if (realIP) {
    return realIP
  }

  if (host) {
    return host.split(':')[0] || 'unknown'
  }

  return 'unknown'
}
