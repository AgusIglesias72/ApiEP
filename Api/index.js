import { Hono } from 'hono'
import data from '../DB/data.json'

const app = new Hono()

app.get('/orders', async (ctx) => {
  return ctx.json(data)
})

app.get('/', async (ctx) => {
  return ctx.json([
    { endpoint: '/orders' },
    { method: 'GET' },
    { description: 'Returns all orders' },
  ])
})

export default app
