import { Router, type Request, type Response } from 'express'
import { auth } from '@/middlewares/auth-middleware'

const router = Router()

router.get('/credential/get', auth, (req, res) => {
  try {
    res.status(200).send(`Sucessfully fetch workflow for ${req.user.email}`)
    return
  } catch (error) { }
  console.log('this')
})

router.post('/credential/create', auth, async (req: Request, res: Response) => {
  try {
    res.status(201).send(`Sucessfully created workflow for ${req.user.email}`)
  } catch (error) { }
})

export { router as credentialRouter }
