import { webSocketMessageSchema } from '@buzz8n/common/types'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET, PORT, logger } from '@/utils'
import { prisma } from '@buzz8n/store'
import { redis } from '@/redis'

type WebSocketData = {
  userId: string
  subscriber: Awaited<ReturnType<typeof redis.duplicate>> | null

  subscribedChannel: string | null
}

Bun.serve<WebSocketData>({
  port: PORT,
  fetch(req, server) {
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
        return new Response('User not authenticated', {
          status: 401,
        })
      }

      const isValidated = jwt.verify(token, JWT_SECRET!)
      if (!isValidated) {
        return new Response('User not authenticated', {
          status: 401,
        })
      }

      const { userId } = isValidated as JwtPayload

      const success = server.upgrade(req, {
        data: { userId, subscribedChannel: null, subscriber: null },
      })
      if (success) return undefined
    } catch (error) {
      return new Response('Invalid token or expired token', {
        status: 401,
      })
    }

    return new Response('Upgrade failed', { status: 500 })
  },
  websocket: {
    // Increase backpressure limit for high-volume messages
    backpressureLimit: 2 * 1024 * 1024, // 2MB
    open(ws) {
      logger.info(`User ${ws.data.userId} connected`)
    },
    async message(ws, message) {
      try {
        console.log('📡 WebSocket server received message:', message)

        const { success, data } = webSocketMessageSchema.safeParse(JSON.parse(message))
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
                `📤 Sending message to user ${ws.data.userId} for workflow ${data.workflowId}`,
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
      if (ws.data.subscriber) {
        await ws.data.subscriber.unsubscribe(ws.data.subscribedChannel!)
        await ws.data.subscriber.quit()
        logger.info(
          `User ${ws.data.userId} unsubscribed from workflow ${ws.data.subscribedChannel}`,
        )
        ws.data.subscriber = null
        ws.data.subscribedChannel = null
      }
      logger.info(`User ${ws.data.userId} disconnected`)
    },
  },
})

logger.info(`🚀 WebSocket server started on port ${PORT}`)
