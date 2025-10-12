import { Router, type Request, type Response, type NextFunction } from 'express'
import { createWorkflowSchema, workflowSchema } from '@buzz8n/common/types'
import { PrismaClientKnownRequestError, prisma } from '@buzz8n/store'
import { auth } from '@/middlewares/auth-middleware'
import { logger } from '@/utils/logger'

const router = Router()

router.use('/workflow', auth)

router.get('/workflow', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit
    const cursor = req.query.cursor

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

    res.status(200).json({ workflows: workflowList })
  } catch (error) {
    next(error)
  }
})

router.put('/workflow/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    //TODO: Fix
    const id = req.params.id
    const { active, name } = req.body

    if (!id) {
      res.status(422).send('Invalid Data')
      return
    }

    const workflow = await prisma.workflow.update({
      where: {
        id,
      },
      data: {
        active,
        name,
      },
    })

    if (!workflow) {
      res.status(404).send('Workflow not found')
      return
    }

    res.status(200).json(workflow)
  } catch (error) {
    next(error)
  }
})

router.get('/workflow/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id

    if (!id) {
      res.status(422).send('Invalid Data')
      return
    }

    const userId = req.user!.userId

    const workflow = await prisma.workflow.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!workflow) {
      console.log('not found id')
      res.status(404).send('Page not found')
      return
    }

    console.log('workflow')
    res.status(200).json(workflow)
  } catch (error) {
    next(error)
  }
})

router.post('/workflow', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { success, data } = createWorkflowSchema.safeParse(req.body)

    if (!success) {
      logger.error('not parsed')
      res.status(422).send('Invalid Data')
      return
    }

    const { active, name } = data
    const userId = req.user!.userId

    const workflow = await prisma.workflow.create({
      data: {
        active,
        name,
        userId,
      },
    })

    if (!workflow) {
      throw new Error('No workflow is created')
    }

    res.status(201).json(workflow)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).send('Workflow with that name already exists')
        return
      }
    }

    next(error)
  }
})

export { router as workflowRouter }
