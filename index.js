import express from 'express'
import cors from 'cors'
import orders from './Api/routes/orders.js'
import dotenv from 'dotenv'

dotenv.config()

const { AUTH_TOKEN } = process.env

const app = express()

app.use(express.json())
app.use(cors())
app.use(
  express.urlencoded({
    extended: true,
  })
)

const PORT = process.env.PORT ?? 8000

const authentication = (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    return res.status(401).send({ error: 'No authorization sent' })
  }
  const [_, token] = authorization.split(' ')
  if (token !== AUTH_TOKEN) {
    return res.status(401).send({ error: 'Unauthorized' })
  }
  next()
}

app.use(authentication)

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
