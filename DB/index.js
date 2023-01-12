import { getOrders } from './MeLi/index.js'
import { getRows, appendData, clearData } from './connections/GoogleAPI.js'
import fs from 'fs'
import { join } from 'path'

const objectKeys = [
  'Estado',
  'FechaCompra',
  'Hora',
  'IdPedido',
  'CanalVenta',
  'Nombre',
  'Mail',
  'DNI',
  'Telefono',
  'Provincia',
  'Pais',
  'TipoEnvio',
  'Stock',
  'MetodoPago',
  'Moneda',
  'Cupon',
  'DescuentoTotal',
  'DescuentoCupon',
  'DescuentoMetodoPago',
  'DescuentoCantidad',
  'CostoEnvio',
  'IngresosBrutos',
  'IngresosNetos',
  'FechaEnvio',
  'FechaPago',
  'RefExterna',
  'Desconectados',
  'Destapados',
  'ANuevo',
  'DesconectadosX2',
  'ComboDescDest',
  'ComboDescAnoNuevo',
  'TotalDesconectados',
  'TotalDestapados',
  'TotalANuevo',
  'CantidadProductos',
  'TotalJuegos',
]

const numericKeys = [
  'Desconectados',
  'Destapados',
  'ANuevo',
  'DesconectadosX2',
  'ComboDescDest',
  'ComboDescAnoNuevo',
  'TotalDesconectados',
  'TotalDestapados',
  'TotalANuevo',
  'CantidadProductos',
  'TotalJuegos',
  'DescuentoTotal',
  'DescuentoCupon',
  'DescuentoMetodoPago',
  'DescuentoCantidad',
  'CostoEnvio',
  'IngresosBrutos',
  'IngresosNetos',
  'RefExterna',
]

const filePath = join(process.cwd(), './DB/data.json')

const toArrayOfObjects = (keys, values) => {
  return values.map((value) => {
    return keys.reduce((object, key, index) => {
      if (numericKeys.includes(key)) {
        object[key] = parseFloat(value[index].replace(',', '.'))
      } else if (value[index] === '') {
        object[key] = null
      } else {
        object[key] = value[index].trim()
      }
      return object
    }, {})
  })
}

const getDateMeli = () => {
  let date = new Date()
  date.setDate(date.getDate() - 15)
  date = date.toISOString().split('T')[0]
  return date
}

export const PostOrdersToMeli = async () => {
  const date = getDateMeli()
  const res = await getRows('Mercado Libre!AT2:AT')
  const values = res.data.values
  let index
  if (values && values.length > 0) {
    index = values.findIndex((value) => value[0] == [date]) + 2
    const range = `Mercado Libre!AT${index}:CM`
    if (index > 1) await clearData(range)
  }
  const orders = await getOrders(date)
  const array = []

  orders.map((order) => {
    array.push(Object.values(order))
  })

  const response = await appendData('Mercado Libre!AT2', array)

  return response
}

export const getOrdersFromGoogle = async () => {
  const response = await getRows('Cada Venta!A2:AK')
  const values = response.data.values
  const orders = toArrayOfObjects(objectKeys, values)
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2))
}
