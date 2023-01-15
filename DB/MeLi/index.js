import dotenv from 'dotenv'
import axios from 'axios'
import https from 'https'
import { parseMPforML } from '../utils/index.js'

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
    httpsAgent: new https.Agent({
      keepAlive: true,
    }),
    timeout: 60000,
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
      httpsAgent: new https.Agent({
        keepAlive: true,
      }),
      timeout: 60000,
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
        httpsAgent: new https.Agent({
          keepAlive: true,
        }),
        timeout: 60000,
      })
      const resDni = await axios.get(
        `https://api.mercadolibre.com/orders/${id}/billing_info`,
        {
          headers: header,
          httpsAgent: new https.Agent({
            keepAlive: true,
          }),
          timeout: 60000,
        }
      )

      const body = res.data
      const shipId = body.shipping.id

      const resShip = await axios.get(
        `https://api.mercadolibre.com/shipments/${shipId}`,
        {
          headers: header,
          httpsAgent: new https.Agent({
            keepAlive: true,
          }),
          timeout: 60000,
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
          httpsAgent: new https.Agent({
            keepAlive: true,
          }),
          timeout: 60000,
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
  } = parseMPforML(objectPayment)

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
