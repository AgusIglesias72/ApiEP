import fs from 'fs'

const getAllOrders = ({ ...params }) => {
  let { page = 1, canal = 'all' } = params
  page = parseInt(page)
  let data = fs.readFileSync('./DB/data.json', 'utf8')
  data = JSON.parse(data)
  if (canal !== 'all') {
    data = data.filter((order) => order.CanalVenta === canal)
  }
  const validPages = Math.ceil(data.length / 50)
  const lastPage = validPages
  if (page > validPages) {
    page = validPages
  }
  const from = (page - 1) * 50
  const to = (page - 1) * 50 + 50
  const orders = data.slice(from, to)
  return {
    totalLenght: data.length,
    page: page,
    lastPage,
    limit: 50,
    orders,
  }
}

const getOneOrder = (id) => {
  let data = fs.readFileSync('./DB/data.json', 'utf8')
  data = JSON.parse(data)
  const order = data.find((order) => order.IdPedido === id)
  const associatedOrders = data.filter(
    (item) =>
      ((item.DNI && item.DNI === order.DNI) ||
        (item.Mail && item.Mail === order.Mail)) &&
      item.IdPedido !== order.IdPedido
  )
  return {
    otherOrders: associatedOrders.length,
    order,
    associatedOrders,
  }
}

export { getAllOrders, getOneOrder }
