// import { Hono } from 'hono'
import express from 'express'
import data from '../DB/data.json' assert { type: 'json' }
import { getOrdersFromGoogle } from '../DB/index.js'

const app = express()

app.use(express.json())

const PORT = process.env.PORT ?? 3000

app.get('/orders', (_req, res) => {
  return res.status(200).send(data)
})

app.get('/', (_req, res) => {
  return res.status(200).send([
    {
      message: 'Hello World',
    },
  ])
})

app.post('/orders', async (_req, res) => {
  const orders = await getOrdersFromGoogle('2023-01-06')
  return res.status(200).send(orders)
})

app.listen(PORT, () => {
  console.log(`Server running port ${PORT}`)
})

export default app
