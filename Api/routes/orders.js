import express from 'express'
import { getAllOrders, getOneOrder } from '../../src/OrdersFunctions.js'
import {
  PostMayorista,
  PostRegalo,
  PostPersonal,
  getRevendedores,
} from '../../src/OtherFuncions.js'

const orders = express.Router()

orders.get('/', (req, res) => {
  const data = getAllOrders(req.query)
  return res.status(data.status).send(data)
})

orders.get('/:id', async (req, res) => {
  if (req.params.id === 'Revendedores' || req.params.id === 'Empresas') {
    const data = await getRevendedores(req.params.id)
    return res.status(data.status).send(data)
  }

  const data = getOneOrder(req.params.id)
  return res.status(data.status).send(data)
})

orders.post('/:canal', async (req, res) => {
  if (req.params.canal === 'mayorista') {
    const res = await PostMayorista(req.body)
    return res
  }

  if (req.params.canal === 'regalo') {
    const res = await PostRegalo(req.body)
    return res
  }

  if (req.params.canal === 'personal') {
    const res = await PostPersonal(req.body)
    return res
  }

  return res.status(400).send({
    'Canal no valido':
      "Los canales validos son 'mayorista' - 'regalo' y 'personal'",
  })
})

export default orders
