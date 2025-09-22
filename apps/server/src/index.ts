import express from 'express'

import { config, PORT } from '@/utils/config'
import { authRouter } from '@/routers/auth'

config.validate(['environment', 'port', 'jwtSecret'])

const app = express()

app.use(express.json())

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK')
})

const routers = [authRouter]

routers.forEach((router) => app.use('/api/v1', router))

app.use('{/*splat}', (req, res) => {
  res.status(404).send('Page not Found')
})

// app.use((err) => { });

app.listen(PORT, () => {
  console.log('Server started at Port: ', PORT)
})
