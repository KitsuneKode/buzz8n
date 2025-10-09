import { Router, type Request, type Response } from 'express'
import { workflowSchema } from '@buzz8n/common/types'
import { auth } from '@/middlewares/auth-middleware'
import { logger } from '@/utils/logger'
import { prisma } from '@buzz8n/store'
const router = Router()

router.use('/workflow', auth)

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId

    const workflowList = await prisma.workflow.findMany({
      where: {
        archived: false,
        userId,
      },
      select: {
        id: true,
        createdAt: true,
        active: true,
        name: true,
        updatedAt: true,
        userId: true,
      },
    })
  } catch (error) {}
})

router.post('/:workflowId', async (req: Request, res: Response) => {
  const workflowId = req.params.workflowId as string

  const isParsed = workflowSchema.safeParse(req.body)
  if (!workflowId || !isParsed.success) {
    logger.error('not parsed')
    console.log(isParsed)

    res.status(422).send('Invalid Data')
    return
  }
})
