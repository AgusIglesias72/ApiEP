import express from 'express'
import fs from 'fs'
import { getOrdersFromGoogle } from './DB/index.js'
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cors())

const PORT = process.env.PORT ?? 8000

app.get('/', (_, res) => {
  return res.send([
    {
      message: 'Hello World',
    },
  ])
})

app.get('/orders', (req, res) => {
  const page = req.query.page ?? 1
  const canal = req.query.canal ?? 'all'
  let data = fs.readFileSync('./DB/data.json', 'utf8')
  data = JSON.parse(data)
  if (canal !== 'all') {
    data = data.filter((order) => order.CanalVenta === canal)
  }
  const from = (page - 1) * 50
  const to = (page - 1) * 50 + 50
  const orders = data.slice(from, to)
  return res.send({
    totalLenght: data.length,
    page: page,
    limit: 50,
    orders,
  })
})

app.get('/orders/:id', (req, res) => {
  const id = req.params.id
  let data = fs.readFileSync('./DB/data.json', 'utf8')
  data = JSON.parse(data)
  const order = data.find((order) => order.IdPedido === id)
  const associatedOrders = data.filter(
    (item) =>
      ((item.DNI === order.DNI && item.DNI !== '') ||
        (item.Mail === order.Mail && item.Mail !== '')) &&
      item.IdPedido !== order.IdPedido
  )
  return res.send({
    length: associatedOrders.length,
    order,
    associatedOrders,
  })
})

app.listen(PORT, () => {
  console.log(`Server running port ${PORT}`)
})
