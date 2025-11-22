import { PrismaClientKnownRequestError, prisma } from '@buzz8n/store'
import type { ExecutionLog } from '@buzz8n/common/types'
import { logger } from '@/utils'
import { redis } from '@/redis'

export const publishNodeEvent = async (executionId: string, log: ExecutionLog) => {
  try {
    await redis.publishExecutionEvent(executionId, log)
    // let execution = null
    if (log.type === 'execution_complete') {
      await prisma.execution.update({
        where: {
          id: executionId,
        },
        data: {
          status: log.status,
          summary: log.executionSummary,
          finishedAt: new Date(),
          createdAt: new Date(log.timestamp),
          durationMs: log.durationMs,
        },
      })
    } else {
      await prisma.execution.update({
        where: {
          id: executionId,
        },
        data: {
          logs: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            push: { ...log, timestamp: log.timestamp.toISOString() } as any, // or Prisma.JsonValue
          },
        },
      })
    }
    // if (!execution) {
    //   logger.error(`${redis.LOG_GROUP} Execution not found`, { executionId })
    //   throw new Error(`[DB]Execution not found: ${executionId}`)
    // }
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        logger.error(`${redis.LOG_GROUP} Execution not found`, { executionId })
        throw new Error(`[DB]Execution not found: ${executionId}`)
      }
    }
    logger.error(`${redis.LOG_GROUP} Error publishing node event`, { executionId, log, err })
    throw new Error(`${redis.LOG_GROUP} Error publishing node event: ${executionId} ${log} ${err}`)
  }
}
