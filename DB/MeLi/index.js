import dotenv from 'dotenv'

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
  const res = await fetch(URLS.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  const body = await res.json()
  const token = body.access_token
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
    const res = await fetch(url(i, from), {
      method: 'GET',
      headers: header,
    })
    const body = await res.json()

    body.results.map((order) => {
      ids.push(order.id)
    })
  }
  return ids
}

export const getOrders = async (from) => {
  const token = await getToken()
  const ids = await getIds(token, from)

  const header = {
    Authorization: `Bearer ${token}`,
  }

  const orders = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`https://api.mercadolibre.com/orders/${id}`, {
        method: 'GET',
        headers: header,
      })
      const res_dni = await fetch(
        `https://api.mercadolibre.com/orders/${id}/billing_info`,
        {
          method: 'GET',
          headers: header,
        }
      )

      const body = await res.json()
      const shipId = body.shipping.id

      const res_ship = await fetch(
        `https://api.mercadolibre.com/shipments/${shipId}`,
        {
          method: 'GET',
          headers: header,
        }
      )

      const body_ship = await res_ship.json()

      const body_dni = await res_dni.json()

      const order = setOrder(body, body_ship)
      return order
    })
  )
  orders.sort((a, b) => {
    return new Date(a.dateCreated) - new Date(b.dateCreated)
  })

  orders.map((order) => {
    console.log(order)
  })

  return orders
}

const setOrder = (object, objectShip) => {
  const order = {
    dateUsFormat: new Date(object.date_created).toLocaleDateString('sv-SE', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    dateCreated: new Date(object.date_created).toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    orderId: object.id,
    orderStatus: object.status,
    orderBuyer: object.buyer.nickname,
    shipDate: objectShip.status_history.date_shipped
      ? new Date(objectShip.status_history.date_shipped).toLocaleString(
          'es-AR',
          {
            timeZone: 'America/Argentina/Buenos_Aires',
          }
        )
      : null,
  }

  return order
}
