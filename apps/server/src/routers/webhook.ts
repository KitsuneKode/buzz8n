import { Router, type Request, type Response, type NextFunction } from 'express'
import { prisma, PrismaClientKnownRequestError } from '@buzz8n/store'
import { auth } from '@/middlewares/auth-middleware'
import { logger } from '@/utils/logger'

const router = Router()

router.use('/webhook', auth)

router.all('/webhook/:webhookId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // if(req.method === 'POST')
    const webhookId = req.params.webhookId
    const { success, data } = createWebhookSchema.safeParse(req.body)
    const userId = req.user!.userId
    if (!webhookId || !success) {
      res.status(422).send('Invalid Data')
      return
    }

    const webhook = await prisma.webhook.create({
      data: {
        title: data.title,
        method: data.method,
        path: data.path,
      },
    })

    if (!webhook) {
      throw new Error('No webhook is created')
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.status(404).send('Webhook with that id does not exists')
        return
      }
    }
    next(error)
  }
})
