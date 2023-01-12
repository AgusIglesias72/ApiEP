import express from 'express'
import { getAllOrders, getOneOrder } from '../../src/OrdersFunctions.js'

const orders = express.Router()

orders.get('/', (req, res) => {
  const data = getAllOrders(req.query)
  return res.send(data)
})

orders.get('/:id', (req, res) => {
  const data = getOneOrder(req.params.id)
  return res.send(data)
})

export default orders
