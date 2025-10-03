import { auth } from '@/middlewares/auth-middleware'
import { Router, type Request } from 'express'
import { logger } from '@/utils/logger'

const router = Router()

router.use('/workflow', auth)

router.post('/workflow/:workflowId', async (req: Request, res) => {
  const workflowId = req.params.workflowId as string

  const isParsed = workflowSchema.safeParse(req.body)
  if (!workflowId || !isParsed.success) {
    logger.error('not parsed')
    console.log(isParsed)

    res.status(422).send('Invalid Data')
    return
  }
})
