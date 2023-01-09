import { Hono } from 'hono'
import data from '../DB/data.json' assert { type: 'json' }
// import { getOrdersFromGoogle } from '../DB/index.js'

const app = new Hono()

app.get('/', (ctx) => {
  return ctx.json([
    {
      message: 'Hello World',
    },
  ])
})

app.get('/orders', (ctx) => {
  return ctx.json(data)
})

// app.post('/orders', async (ctx) => {
//   const orders = await getOrdersFromGoogle('2023-01-06')
//   return ctx.json(orders)
// })

export default app
