import { getOrders } from './MeLi/index.js'
import { getRows } from './connections/GoogleAPI.js'
import * as json from './connections/cred.json' assert { type: 'json' }

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

const PostOrdersToMeli = async () => {
  const orders = await getOrders('2023-01-05')
  const array = []

  orders.map((order) => {
    array.push(Object.values(order))
  })
  console.log(array)

  return array
}

const toArrayOfObjects = (keys, values) => {
  return values.map((value) => {
    return keys.reduce((object, key, index) => {
      object[key] = value[index]
      return object
    }, {})
  })
}

const getOrdersFromGoogle = async () => {
  const response = await getRows('Cada Venta!A1:AK')
  const values = response.data.values
  const orders = toArrayOfObjects(objectKeys, values)
  return orders
}

const allOrders = await getOrdersFromGoogle()

console.log(allOrders)
