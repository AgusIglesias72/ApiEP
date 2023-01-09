import express from 'express'
import fs from 'fs'
import { getOrdersFromGoogle } from './DB/index.js'
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cors())

const PORT = process.env.PORT ?? 3000

const data = fs.readFileSync('./DB/data.json', 'utf8')

app.get('/', (_, res) => {
  return res.send([
    {
      message: 'Hello World',
    },
  ])
})

app.get('/orders', (_, res) => {
  return res.send(JSON.parse(data))
})

app.post('/orders', async (req, res) => {
  const orders = await getOrdersFromGoogle()
  return res.send(orders)
})

app.listen(PORT, () => {
  console.log(`Server running port ${PORT}`)
})
