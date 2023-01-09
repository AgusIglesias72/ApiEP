import { getOrders } from './MeLi/index.js'
import { getRows } from './connections/GoogleAPI.js'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

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

const filePath = join(process.cwd(), './DB/data.txt')

const toArrayOfObjects = (keys, values) => {
  return values.map((value) => {
    return keys.reduce((object, key, index) => {
      object[key] = value[index]
      return object
    }, {})
  })
}

const PostOrdersToMeli = async () => {
  const orders = await getOrders('2023-01-06')
  const array = []

  orders.map((order) => {
    array.push(Object.values(order))
  })

  return array
}

export const getOrdersFromGoogle = async () => {
  const response = await getRows('Cada Venta!A2:AK')
  const values = response.data.values
  const orders = toArrayOfObjects(objectKeys, values)
  await writeFile(filePath, JSON.stringify(orders, null, 2))
  return orders
}
