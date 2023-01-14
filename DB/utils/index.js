import { appendData, getRows } from '../connections/GoogleAPI.js'

export const parseMPforML = (object) => {
  const payments = object.results.filter((payment) => {
    return payment.status === 'approved'
  })
  let mpCost = 0
  let ganancias = 0
  let iva = 0
  let tiendaFee = 0
  let sirtac = 0
  let otrosImp = 0

  let received = 0
  let cuotas = 0
  let datereleased = null

  payments.map((payment) => {
    received = payment.transaction_details.net_received_amount
    cuotas = payment.installments

    if (payment.money_release_date) {
      datereleased = new Date(payment.money_release_date).toLocaleString(
        'es-AR',
        {
          timeZone: 'America/Argentina/Buenos_Aires',
        }
      )
    }

    payment.charges_details.map((charge) => {
      if (charge.name === 'meli_fee') {
        mpCost += charge.amounts.original
        return
      }
      if (charge.name === 'tax_withholding-retencion_ganancias') {
        ganancias += charge.amounts.original
        return
      }
      if (charge.name === 'tax_withholding-retencion_iva') {
        iva += charge.amounts.original
        return
      }
      if (charge.name === 'third_payment') {
        tiendaFee += charge.amounts.original
        return
      }
      if (charge.name.includes('sirtac')) {
        sirtac += charge.amounts.original
        return
      }
      if (
        charge.name === 'shp_fulfillment' ||
        charge.name === 'ship_fulfillment' ||
        charge.name === 'coupon_off'
      )
        return
      otrosImp += charge.amounts.original
      return
    })
  })

  return {
    mpCost: mpCost.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    ganancias: ganancias.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    iva: iva.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    tiendaFee: tiendaFee.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    sirtac: sirtac.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    otrosImp: otrosImp.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    received: received.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    cuotas: cuotas,
    dateReleased: datereleased ? datereleased.replace(',', '') : datereleased,
  }
}

export const addRebotado = async (number) => {
  const rows = await getRows('Rebotados!E:E')
  const status = rows.status
  const values = rows.data.values
  if (status === 200) {
    const index = values.findIndex((value) => value[0] == [number])
    if (index === -1) {
      const data = [number]
      const append = await appendData(`Rebotados!E${values.length + 1}`, [data])
      return append
    } else {
      return 'Already exists'
    }
  } else {
    return 'Error'
  }
}

export const parseMPforTN = (object) => {
  const payments = object.results.filter((payment) => {
    return payment.status === 'approved'
  })
  let mpCost = 0
  let ganancias = 0
  let iva = 0
  let tiendaFee = 0
  let sirtac = 0
  let otrosImp = 0

  let received = 0
  let cuotas = 0
  let datereleased = null

  payments.map((payment) => {
    received = payment.transaction_details.net_received_amount
    cuotas = payment.installments

    if (payment.money_release_date) {
      datereleased = new Date(payment.money_release_date).toLocaleString(
        'es-AR',
        {
          timeZone: 'America/Argentina/Buenos_Aires',
        }
      )
    }

    payment.charges_details.map((charge) => {
      if (charge.name === 'mercadopago_fee') {
        mpCost += charge.amounts.original
        return
      }
      if (charge.name === 'tax_withholding-retencion_ganancias') {
        ganancias += charge.amounts.original
        return
      }
      if (charge.name === 'tax_withholding-retencion_iva') {
        iva += charge.amounts.original
        return
      }
      if (charge.name === 'third_payment') {
        tiendaFee += charge.amounts.original
        return
      }
      if (charge.name.includes('sirtac')) {
        sirtac += charge.amounts.original
        return
      }
      if (
        charge.name === 'shp_fulfillment' ||
        charge.name === 'ship_fulfillment' ||
        charge.name === 'coupon_off'
      )
        return
      otrosImp += charge.amounts.original
      return
    })
  })

  return {
    mpCost: mpCost.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    ganancias: ganancias.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    iva: iva.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    tiendaFee: tiendaFee.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    sirtac: sirtac.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    otrosImp: otrosImp.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    received: received.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    cuotas: cuotas,
    dateReleased: datereleased ? datereleased.replace(',', '') : datereleased,
  }
}
