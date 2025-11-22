import {
  webSocketRateLimiter,
  generateConnectionId,
  getClientIP,
  WEBSOCKET_RATE_LIMITS,
} from '@/rate-limiter'
import { webSocketMessageSchema } from '@buzz8n/common/types'
import { JWT_SECRET, PORT, config, logger } from '@/utils'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import type { ServerWebSocket } from 'bun'
import { prisma } from '@buzz8n/store'
import { redis } from '@/redis'

type WebSocketData = {
  userId: string
  subscriber: Awaited<ReturnType<typeof redis.duplicate>> | null
  subscribedChannel: string | null
  connectionId: string
  ip: string
  messageCount: number
  lastMessageAt: number
  lastPongAt: number
  isAlive: boolean
}
config.validateAll()

// Store all active WebSocket connections for heartbeat monitoring
const activeConnections = new Set<ServerWebSocket<WebSocketData>>()

Bun.serve<WebSocketData>({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url)
    const clientIP = getClientIP(req)

    // Unauthenticated health check endpoint
    if (url.pathname === '/health') {
      logger.info('WebSocket Server health check by IP ', { clientIP })
      return new Response(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          connections: server.pendingWebSockets,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const cookieHeader = req.headers.get('cookie')

    try {
      const cookies =
        cookieHeader?.split('; ').reduce(
          (acc, cookie) => {
            const [name, value] = cookie.split('=')
            if (name) {
              acc[name] = value || ''
            }
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      const token = cookies?.['buzz8n_auth']

      if (!token || !cookies) {
        logger.warn('User not authenticated', { clientIP, cookieHeader })
        return new Response('User not authenticated', {
          status: 401,
        })
      }

      const { userId } = jwt.verify(token, JWT_SECRET!) as JwtPayload

      // Check WebSocket rate limits
      const rateLimitResult = await webSocketRateLimiter.checkConnectionAllowed(userId, clientIP)

      if (!rateLimitResult.allowed) {
        logger.warn('WebSocket connection blocked by rate limit', {
          userId,
          ip: clientIP,
          reason: rateLimitResult.reason,
        })

        return new Response(`Connection blocked: ${rateLimitResult.reason}`, {
          status: 429,
        })
      }

      const connectionId = generateConnectionId()

      // Register the connection
      await webSocketRateLimiter.registerConnection(userId, clientIP, connectionId)

      const success = server.upgrade(req, {
        data: {
          userId,
          subscribedChannel: null,
          subscriber: null,
          connectionId,
          ip: clientIP,
          messageCount: 0,
          lastMessageAt: Date.now(),
          lastPongAt: Date.now(),
          isAlive: true,
        },
      })

      if (success) {
        logger.info('WebSocket connection established', {
          userId,
          ip: clientIP,
          connectionId,
        })
        return undefined
      }
    } catch (error) {
      logger.error('WebSocket connection error', { error, ip: clientIP })
      return new Response('Invalid token or expired token', {
        status: 401,
      })
    }
    return new Response('Expected WebSocket connection', { status: 426 })
  },
  websocket: {
    // Increase backpressure limit for high-volume messages
    backpressureLimit: 2 * 1024 * 1024, // 2MB
    open(ws) {
      // Add to active connections for heartbeat monitoring
      activeConnections.add(ws)

      logger.info(`User ${ws.data.userId} connected`, {
        connectionId: ws.data.connectionId,
        ip: ws.data.ip,
      })
    },
    async message(ws, message) {
      try {
        // Handle pong response from client
        if (message.toString() === 'pong') {
          ws.data.lastPongAt = Date.now()
          ws.data.isAlive = true
          logger.debug('Received pong from client', {
            connectionId: ws.data.connectionId,
            userId: ws.data.userId,
          })
          return
        }

        logger.info('WebSocket server received message:', message)

        // Check message rate limits
        const messageSize = message.length
        const rateLimitResult = await webSocketRateLimiter.checkMessageAllowed(
          ws.data.connectionId,
          messageSize,
        )

        if (!rateLimitResult.allowed) {
          logger.warn('WebSocket message blocked by rate limit', {
            userId: ws.data.userId,
            connectionId: ws.data.connectionId,
            reason: rateLimitResult.reason,
            messageSize,
          })

          ws.close(1008, `Message blocked: ${rateLimitResult.reason}`)
          return
        }

        if (message.length > WEBSOCKET_RATE_LIMITS.maxMessageSize) {
          ws.close(1009, 'Message too large')
          return
        }

        const { success, data } = webSocketMessageSchema.safeParse(JSON.parse(message.toString()))
        if (!success) {
          logger.error('Invalid message', { message })
          ws.close(1008, 'Invalid message')
          return
        }

        if (data && data.type === 'subscribe') {
          const isAuthorized = await prisma.workflow.findUnique({
            where: {
              id: data.workflowId,
              userId: ws.data.userId,
            },
          })

          if (!isAuthorized) {
            logger.error(
              `User ${ws.data.userId} is not authorized to subscribe to workflow ${data.workflowId}`,
            )
            ws.close(1008, 'Unauthorized: User is not authorized to subscribe to this workflow')
            return
          }

          if (ws.data.subscriber) {
            await ws.data.subscriber.unsubscribe(ws.data.subscribedChannel!)
          }

          ws.data.subscriber = await redis.duplicate()
          await ws.data.subscriber.connect()
          const channelId = data.executionId
          ws.data.subscribedChannel = `${redis.CHANNELS.EXECUTION_EVENTS}:${channelId}`
          await ws.data.subscriber.subscribe(ws.data.subscribedChannel!, (message) => {
            if (ws.readyState === WebSocket.OPEN) {
              logger.info(
                `Sending message to user ${ws.data.userId} for workflow ${data.workflowId}`,
                { type: JSON.parse(message).type },
              )

              ws.send(message)
            }
          })
        }

        if (data && data.type === 'unsubscribe') {
          if (ws.data.subscriber) {
            await ws.data.subscriber.unsubscribe(ws.data.subscribedChannel!)
            // await ws.data.subscriber.quit()
            logger.info(
              `User ${ws.data.userId} unsubscribed from workflow ${ws.data.subscribedChannel}`,
            )
            ws.data.subscriber = null
            ws.data.subscribedChannel = null
          }
        }
      } catch (error) {
        logger.error('Error processing message', { error })
        ws.close(1008, 'Invalid message')
      }
    },
    async close(ws) {
      // Remove from active connections
      activeConnections.delete(ws)

      if (ws.data.subscriber) {
        await ws.data.subscriber.unsubscribe(ws.data.subscribedChannel!)
        await ws.data.subscriber.quit()
        logger.info(
          `User ${ws.data.userId} unsubscribed from workflow ${ws.data.subscribedChannel}`,
        )
        ws.data.subscriber = null
        ws.data.subscribedChannel = null
      }

      // Unregister connection from rate limiter
      await webSocketRateLimiter.unregisterConnection(
        ws.data.userId,
        ws.data.ip,
        ws.data.connectionId,
      )

      logger.info(`User ${ws.data.userId} disconnected`, {
        connectionId: ws.data.connectionId,
        ip: ws.data.ip,
        messageCount: ws.data.messageCount,
      })
    },
  },
})

logger.info(`WebSocket server started on port ${PORT}`)

// Active heartbeat interval to monitor and cleanup stale connections
const HEARTBEAT_INTERVAL = 30000 // 30 seconds - how often to send pings
const HEARTBEAT_TIMEOUT = 60000 // 60 seconds - close if no pong received

setInterval(() => {
  const now = Date.now()
  let closedCount = 0
  const totalConnections = activeConnections.size

  logger.debug(`Running heartbeat check on ${totalConnections} connections`)

  activeConnections.forEach((ws) => {
    try {
      // Check if connection is stale (no pong since last ping)
      if (!ws.data.isAlive) {
        const staleDuration = now - ws.data.lastPongAt
        if (staleDuration > HEARTBEAT_TIMEOUT) {
          logger.warn('Closing stale WebSocket connection', {
            connectionId: ws.data.connectionId,
            userId: ws.data.userId,
            lastPongAt: new Date(ws.data.lastPongAt).toISOString(),
            staleDuration,
          })
          ws.close(1008, 'No heartbeat response')
          closedCount++
          return
        }
      }

      // Mark as not alive and send ping
      ws.data.isAlive = false
      ws.send('ping')
      logger.debug('Sent ping to client', {
        connectionId: ws.data.connectionId,
        userId: ws.data.userId,
      })
    } catch (error) {
      logger.error('Error during heartbeat check', {
        connectionId: ws.data.connectionId,
        error,
      })
    }
  })

  if (closedCount > 0) {
    logger.info(`Cleaned up ${closedCount} stale connections`)
  }
}, HEARTBEAT_INTERVAL)

logger.info(
  `Active heartbeat enabled: interval=${HEARTBEAT_INTERVAL}ms, timeout=${HEARTBEAT_TIMEOUT}ms`,
)
