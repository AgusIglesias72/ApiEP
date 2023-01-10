import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const {
  AUTH_TIENDANUBE,
  AUTH_SHIPNOW,
  AUTH_MERCADOPAGO,
  AUTH_MELI_REFRESH_TOKEN,
  AUTH_MELI_CLIENT_SECRET,
  AUTH_MELI_CLIENT_ID,
} = process.env

const URLS = {
  tokenUrl: `https://api.mercadolibre.com/oauth/token?grant_type=refresh_token&client_id=${AUTH_MELI_CLIENT_ID}&client_secret=${AUTH_MELI_CLIENT_SECRET}&refresh_token=${AUTH_MELI_REFRESH_TOKEN}`,
}

const getToken = async () => {
  console.log('Ejecutando getToken')
  const res = await axios.post(URLS.tokenUrl, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  const token = res.data.access_token
  return token
}

const getIds = async (token, from) => {
  const header = {
    Authorization: `Bearer ${token}`,
  }
  const url = (i, from) =>
    `https://api.mercadolibre.com/orders/search?seller=701499356&offset=${i}&limit=50&order.date_created.from=${from}T00:00:00.000-03:00`

  const ids = []

  for (let i = 0; i < 2000; i += 50) {
    const res = await axios.get(url(i, from), {
      headers: header,
    })
    const body = res.data

    body.results.map((order) => {
      ids.push(order.id)
    })
  }
  return ids
}

export const getOrders = async (from) => {
  const token = await getToken()
  const ids = await getIds(token, from)
  console.log(token)
  const header = {
    Authorization: `Bearer ${token}`,
  }

  const orders = await Promise.all(
    ids.map(async (id) => {
      const res = await axios.get(`https://api.mercadolibre.com/orders/${id}`, {
        headers: header,
      })
      const resDni = await axios.get(
        `https://api.mercadolibre.com/orders/${id}/billing_info`,
        {
          headers: header,
        }
      )

      const body = res.data
      const shipId = body.shipping.id

      const resShip = await axios.get(
        `https://api.mercadolibre.com/shipments/${shipId}`,
        {
          headers: header,
        }
      )
      const mpId = body.id
      const resPayment = await axios.get(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${mpId}`,
        {
          headers: {
            Authorization: AUTH_MERCADOPAGO,
            Accept: 'application/json',
          },
        }
      )

      const bodyShip = resShip.data
      const bodyDoc = resDni.data
      const bodyPayment = resPayment.data

      const order = setOrder(body, bodyDoc, bodyShip, bodyPayment)
      return order
    })
  )
  orders.sort((a, b) => {
    return new Date(a.dateCreated) - new Date(b.dateCreated)
  })

  return orders
}

const setOrder = (object, objectDocs, objectShip, objectPayment) => {
  const dateUsFormat = new Date(object.date_created).toLocaleDateString(
    'sv-SE',
    {
      timeZone: 'America/Argentina/Buenos_Aires',
    }
  )

  const {
    mpCost,
    ganancias,
    iva,
    tiendaFee,
    sirtac,
    otrosImp,
    dateReleased,
    received,
    cuotas,
  } = parseMP(objectPayment)

  const order = {
    formula: `=LEFTB("${dateUsFormat}";10)`,
    orderId: `="${object.id}"`,
    dateCreated: new Date(object.date_created)
      .toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })
      .replace(',', ''),
    orderBuyer: `${object.buyer.first_name} ${object.buyer.last_name}`,
    orderDNI: objectDocs.billing_info.doc_number,
    product: object.order_items[0].item.title,
    price: object.order_items[0].full_unit_price.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    quantity: object.order_items[0].quantity,
    currency: object.currency_id,
    shipId: `="${object.shipping.id}"`,
    orderStatus: object.status,
    buyerNick: object.buyer.nickname,
    buyerId: `="${object.buyer.id}"`,
    packId: `="${object.pack_id}"`,
    shipCost: objectShip.shipping_option.cost
      ? objectShip.shipping_option.cost.toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
        })
      : null,
    baseCost: objectShip.base_cost
      ? objectShip.base_cost.toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
        })
      : null,
    loyaltyDiscount: objectShip.cost_components.loyalty_discount
      ? objectShip.cost_components.loyalty_discount.toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
        })
      : null,
    logisticType: objectShip.logistic_type ? objectShip.logistic_type : null,
    shipStatus: objectShip.status ? objectShip.status : null,
    stateName: objectShip.receiver_address.state.name
      ? objectShip.receiver_address.state.name
      : null,
    cityName: objectShip.receiver_address.city.name
      ? objectShip.receiver_address.city.name
      : null,
    zipCode: objectShip.receiver_address.zip_code
      ? objectShip.receiver_address.zip_code
      : null,
    shipDate: objectShip.status_history.date_shipped
      ? new Date(objectShip.status_history.date_shipped)
          .toLocaleString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
          })
          .replace(',', '')
      : null,
    deliverDate: objectShip.status_history.date_delivered
      ? new Date(objectShip.status_history.date_delivered)
          .toLocaleString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
          })
          .replace(',', '')
      : null,
    notDeliverDate: objectShip.status_history.date_not_delivered
      ? new Date(objectShip.status_history.date_not_delivered)
          .toLocaleString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
          })
          .replace(',', '')
      : null,
    mpCost: mpCost,
    iva: iva,
    ganancias: ganancias,
    sirtac: sirtac,
    otrosImp: otrosImp,
    tiendaFee: tiendaFee,
    dateReleased: dateReleased,
    cuotas: cuotas,
    received: received,
  }

  return order
}

const parseMP = (object) => {
  const payment = object.results.filter((payment) => {
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

  payment.map((payment) => {
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
