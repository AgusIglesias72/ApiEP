import express from 'express'
import cors from 'cors'
import orders from './Api/routes/orders.js'

const app = express()

app.use(express.json())
app.use(cors())

const PORT = process.env.PORT ?? 8000

app.get('/', (_, res) => {
  return res.send({
    'Welcome to the API. Please use "/api" to access the endpoints': [
      {
        '/api/orders': 'Get all orders',
        'query params': [{ page: 'Page number' }, { canal: 'Channel name' }],
      },
      { '/api/orders/:id': 'Get a specific order' },
    ],
  })
})

app.use('/api/orders', orders)

app.listen(PORT, () => {
  console.log(`Server running port ${PORT}`)
})
