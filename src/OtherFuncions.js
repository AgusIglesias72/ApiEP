import { getRows, appendData, clearData } from '../DB/connections/GoogleAPI.js'
import fs from 'fs'

const genereteId = () => {
  const month = new Date().toLocaleString('es-AR', { month: '2-digit' })
  const year = new Date().toLocaleString('es-AR', { year: 'numeric' })
  const date = new Date().toLocaleString('es-AR', { day: '2-digit' })
  const random = Math.floor(Math.random() * 1000)
  const id = `${month}${year}${date}${random}`

  return id
}

export const PostMayorista = async (object) => {
  try {
    const rows = await getRows('Mayoristas!A2:A')
    const values = rows.data.values
    const from = values.length + 2

    const date = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const {
      fecha_compra,
      canal_venta,
      nombre,
      mail,
      dni,
      telefono,
      zip_code,
      ciudad,
      provincia,
      pais,
      tipo_envio,
      stock,
      metodo_pago,
      moneda,
      fecha_envio,
      fecha_pago,
      costo_envio,
    } = object

    const productos = object.productos

    const append = []

    const id = genereteId()

    for (let i = 0; i < productos.length; i++) {
      const thisRow = []
      thisRow.push('Finalizada')
      if (fecha_compra === '') {
        thisRow.push(date)
      } else {
        thisRow.push(fecha_compra)
      }
      thisRow.push('')
      thisRow.push(
        `=SI.ERROR(""&IFS(REGEXMATCH(E${
          from + i
        };"Reventa");"REV-";REGEXMATCH(E${from + i};"Empresa");"EMP-")&""&F${
          from + i
        }&"";"")`
      )
      thisRow.push(canal_venta)
      thisRow.push(id)
      thisRow.push(nombre)
      thisRow.push(mail)
      thisRow.push(dni)
      thisRow.push(telefono)
      thisRow.push(productos[i].nombre)
      thisRow.push(productos[i].cantidad)
      thisRow.push(zip_code)
      thisRow.push(ciudad)
      thisRow.push(provincia)
      thisRow.push(pais)
      thisRow.push(tipo_envio)
      thisRow.push(stock)
      thisRow.push(metodo_pago)
      thisRow.push(moneda)
      thisRow.push(productos[i].precio)
      thisRow.push(`=U${from + i}*L${from + i}`)
      thisRow.push('')
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      if (i === 0) {
        thisRow.push(costo_envio)
      } else {
        thisRow.push(0)
      }

      thisRow.push('1')
      thisRow.push(`=V${from + i}+AH${from + i}`)
      thisRow.push(`=AJ${from + i}-SUMAPRODUCTO($X${from + i}:$AG${from + i})`)
      thisRow.push(fecha_envio)
      thisRow.push(fecha_pago)
      thisRow.push(fecha_pago)
      thisRow.push('Entregado')

      append.push(thisRow)
    }

    const range = `Mayoristas!A${from}:AO${from}`
    await clearData(range)
    setTimeout(async () => {
      await appendData(range, append)
    }, 1000)
    return { status: 200, message: 'Ok' }
  } catch (err) {
    console.log(err)
    return { status: 400, message: 'Error' }
  }
}

export const PostRegalo = async (object) => {
  try {
    const rows = await getRows('Regalos!A2:A')
    const values = rows.data.values
    const from = values.length + 2

    const date = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const {
      fecha_compra,
      nombre,
      mail,
      dni,
      telefono,
      zip_code,
      ciudad,
      provincia,
      pais,
      tipo_envio,
      stock,
      fecha_envio,
    } = object

    const productos = object.productos

    const append = []

    const id = genereteId()

    for (let i = 0; i < productos.length; i++) {
      const thisRow = []
      thisRow.push('Finalizada')
      if (fecha_compra === '') {
        thisRow.push(date)
      } else {
        thisRow.push(fecha_compra)
      }
      thisRow.push('')
      thisRow.push(
        `=SI.ERROR(""&IFS(REGEXMATCH(E${from};"Regalo");"RG-")&""&F${from}&"";"")`
      )
      thisRow.push('Regalo')
      thisRow.push(id)
      thisRow.push(nombre)
      thisRow.push(mail)
      thisRow.push(dni)
      thisRow.push(telefono)
      thisRow.push(productos[i].nombre)
      thisRow.push(productos[i].cantidad)
      thisRow.push(zip_code)
      thisRow.push(ciudad)
      thisRow.push(provincia)
      thisRow.push(pais)
      thisRow.push(tipo_envio)
      thisRow.push(stock)
      thisRow.push('Regalado')
      thisRow.push('ARS')
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push('')
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push('1')
      thisRow.push(0)
      thisRow.push(0)
      thisRow.push(fecha_envio)
      thisRow.push(fecha_compra)
      thisRow.push(fecha_compra)
      thisRow.push('Entregado')

      append.push(thisRow)
    }

    const range = `Regalos!A${from}:AO${from}`
    await clearData(range)
    setTimeout(async () => {
      await appendData(range, append)
    }, 1000)

    return { status: 200, message: 'Ok' }
  } catch (err) {
    console.log(err)
    return { status: 400, message: 'Error' }
  }
}

export const PostPersonal = async (object) => {
  try {
    const rows = await getRows('Personales!A2:A')

    const values = rows.data.values
    const from = values.length + 2

    const date = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const {
      fecha_compra,
      canal_venta,
      nombre,
      mail,
      dni,
      telefono,
      zip_code,
      ciudad,
      provincia,
      pais,
      tipo_envio,
      stock,
      metodo_pago,
      moneda,
      fecha_envio,
      fecha_pago,
      dcto_cupon,
      dcto_metodo_pago,
      dcto_cantidad,
      costo_MP,
      iva,
      ganancias,
      sirtac,
      otrosImp,
      plataforma,
      costo_envio,
    } = object

    const productos = object.productos

    const append = []

    const id = genereteId()

    for (let i = 0; i < productos.length; i++) {
      const thisRow = []
      thisRow.push('Finalizada')
      if (fecha_compra === '') {
        thisRow.push(date)
      } else {
        thisRow.push(fecha_compra)
      }
      thisRow.push('')
      thisRow.push(
        `=SI.ERROR(""&IFS(REGEXMATCH(E${from};"Personal");"PE-";REGEXMATCH(E${from};"Tienda Nube");"TN-")&""&F${from}&"";"")`
      )
      thisRow.push(canal_venta)
      thisRow.push(id)
      thisRow.push(nombre)
      thisRow.push(mail)
      thisRow.push(dni)
      thisRow.push(telefono)
      thisRow.push(productos[i].nombre)
      thisRow.push(productos[i].cantidad)
      thisRow.push(zip_code)
      thisRow.push(ciudad)
      thisRow.push(provincia)
      thisRow.push(pais)
      thisRow.push(tipo_envio)
      thisRow.push(stock)
      thisRow.push(metodo_pago)
      thisRow.push(moneda)
      thisRow.push(productos[i].precio)
      thisRow.push(`=U${from + i}*L${from + i}`)
      thisRow.push('')
      if (i === 0) {
        thisRow.push(dcto_cupon + dcto_metodo_pago + dcto_cantidad)
        thisRow.push(dcto_cupon)
        thisRow.push(dcto_metodo_pago)
        thisRow.push(dcto_cantidad)
        thisRow.push(costo_MP)
        thisRow.push(iva)
        thisRow.push(ganancias)
        thisRow.push(sirtac)
        thisRow.push(otrosImp)
        thisRow.push(plataforma)
        thisRow.push(costo_envio)
      } else {
        thisRow.push(0)
        thisRow.push(0)
        thisRow.push(0)
        thisRow.push(0)
        thisRow.push(0)
        thisRow.push(0)
        thisRow.push(0)
        thisRow.push(0)
        thisRow.push(0)
        thisRow.push(0)
        thisRow.push(0)
      }

      thisRow.push('1')
      thisRow.push(`=V${from}+AH${from}`)
      thisRow.push(`=AJ${from}-SUMAPRODUCTO($X${from}:$AG${from})`)
      thisRow.push(fecha_envio)
      thisRow.push(fecha_pago)
      thisRow.push(fecha_pago)
      thisRow.push('Entregado')

      append.push(thisRow)
    }

    const range = `Personales!A${from}:AO${from}`
    await clearData(range)
    setTimeout(async () => {
      await appendData(range, append)
    }, 1000)

    return { status: 200, message: 'Ok' }
  } catch (err) {
    console.log(err)
    return { status: 400, message: 'Error' }
  }
}

export const getRevendedores = async () => {
  try {
    const canal = 'Reventa'
    let data = fs.readFileSync('./DB/data.json', 'utf8')
    data = JSON.parse(data)
    data = data.filter((order) => order.CanalVenta === canal)

    const revendedores = new Set(data.map((order) => order.Nombre))

    const revendedoresArray = Array.from(revendedores)

    let allRevendedores = revendedoresArray.map((Nombre) => {
      const revendedorData = data.filter((order) => order.Nombre === Nombre)
      const Email = revendedorData[0].Email
      const CUIT = revendedorData[0].DNI
      const Telefono = revendedorData[0].Telefono
      const Provincia = revendedorData[0].Provincia
      const Pais = revendedorData[0].Pais
      const CantidadCompras = revendedorData.length
      const UltimaCompra = revendedorData[0].FechaCompra
      const JuegosComprados = {
        Desconectados: revendedorData.reduce(
          (acc, order) => acc + order.TotalDesconectados,
          0
        ),
        Destapados: revendedorData.reduce(
          (acc, order) => acc + order.TotalDestapados,
          0
        ),
        AñoNuevo: revendedorData.reduce(
          (acc, order) => acc + order.TotalANuevo,
          0
        ),
      }
      const OrdenesAsociadas = Array.from(
        new Set(revendedorData.map((order) => order.IdPedido))
      )

      return {
        Nombre,
        Email,
        CUIT,
        Telefono,
        Provincia,
        Pais,
        CantidadCompras,
        UltimaCompra,
        JuegosComprados,
        OrdenesAsociadas,
      }
    })

    allRevendedores.sort((a, b) => b.CantidadCompras - a.CantidadCompras)

    return { status: 200, message: 'Ok', data: allRevendedores }
  } catch (err) {
    console.log(err)
    return { status: 400, message: 'Error' }
  }
}
