import dotenv from 'dotenv'
import axios from 'axios'
import { parseMPforTN, addRebotado } from '../utils/index.js'
import https from 'https'

dotenv.config()

const { AUTH_TIENDANUBE, AUTH_SHIPNOW, AUTH_MERCADOPAGO } = process.env

const headers = {
  'Content-Type': 'application/json',
  Authentication: AUTH_TIENDANUBE,
  'User-Agent': 'En Palabras (enpalabrass@gmail.com)',
}

const getAllOrdersTN = async (from) => {
  const data = []
  const fields =
    'id,number,status,created_at,payment_status,paid_at,shipping_status,shipped_at,shipping_cost_customer,currency,gateway_name,customer,shipping_address,billing_phone,shipping_pickup_type,shipping_option,discount,promotional_discount,discount_gateway,discount_coupon,coupon,products'

  //   const fields = 'id,number'
  const url = (i, field) =>
    `https://api.tiendanube.com/v1/1705915/orders?fields=${field}&page=${i}&per_page=200`
  for (let i = 1; i < 2; i++) {
    console.log(i)
    const res = await axios.get(url(i, fields), {
      headers: headers,
      httpsAgent: new https.Agent({
        keepAlive: true,
      }),
      timeout: 60000,
    })
    let body = res.data
    body = body.filter((order) => {
      return order.number >= from
    })

    body.map((order) => {
      data.push(order)
    })
  }
  let ordersArray = new Set(data)
  ordersArray = [...ordersArray]
  return ordersArray
}

export const getTNOrders = async (from, to) => {
  const data = await getAllOrdersTN(from, to)
  const orders = []
  await Promise.all(
    data.map(async (item) => {
      let snBody = null
      if (
        !item.shipping_option.includes('Recoleta') &&
        !item.shipping_option.includes('DHL')
      ) {
        while (snBody === null) {
          const snRes = await axios.get(
            `https://api.shipnow.com.ar/orders?external_reference=${item.id}`,
            {
              headers: {
                Accept: 'application/json',
                Authorization: AUTH_SHIPNOW,
              },
              httpsAgent: new https.Agent({
                keepAlive: true,
              }),
              timeout: 60000,
            }
          )
          if (snRes.status === 200) {
            snBody = snRes.data
          }
        }
      }

      let mpBody = null
      if (item.gateway_name === 'Mercado Pago') {
        while (mpBody === null) {
          const mpRes = await axios.get(
            `https://api.mercadopago.com/v1/payments/search?external_reference=${item.id}`,
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
          if (mpRes.status === 200) {
            mpBody = mpRes.data
          }
        }
      }

      for (let i = 0; i < item.products.length; i++) {
        console.log(item.paid_at)
        const order = setOrder(i, item, snBody, mpBody)
        console.log(order)
        orders.push(order)
      }
    })
  )
  orders.sort((a, b) => {
    return new Date(a.number) - new Date(b.number)
  })
  return orders
}

const setOrder = (i, object, objectShip, objectPayment) => {
  let mpCost = ''
  let ganancias = ''
  let iva = ''
  let tiendaFee = ''
  let sirtac = ''
  let otrosImp = ''
  let dateReleased = ''
  let received = ''
  let cuotas = ''

  if (objectPayment !== null) {
    const mpData = parseMPforTN(objectPayment)
    mpCost = mpData.mpCost
    ganancias = mpData.ganancias
    iva = mpData.iva
    tiendaFee = mpData.tiendaFee
    sirtac = mpData.sirtac
    otrosImp = mpData.otrosImp
    dateReleased = mpData.dateReleased
    received = mpData.received
    cuotas = mpData.cuotas
  }

  const order = {
    number: object.number,
    date: new Date(object.created_at)
      .toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })
      .replace(',', ''),

    name: object.customer.name || '',
    email: object.customer.email || '',
    dni: object.customer.identification || '',
    phone:
      object.customer.phone
        .replace('+', '')
        .replace(' ', '')
        .toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
        }) || '',
    status: object.status,
    shipType: object.shipping_pickup_type,
    shipDetail: object.shipping_option,
    gateway: object.gateway_name,
    currency: object.currency,
    itemName: object.products[i].name,
    itemPrice: object.products[i].price.replace('.', ','),
    itemQuantity: object.products[i].quantity,
    totalDiscount: object.discount.replace('.', ','),
    quantityDiscount:
      object.promotional_discount.promotions_applied.length > 0
        ? object.promotional_discount.promotions_applied[0]
            .total_discount_amount
        : 0,
    paymentDiscount: object.discount_gateway.replace('.', ','),
    cuponDiscount: object.discount_coupon
      .toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })
      .replace('.', ','),
    cupon: object.coupon[0] ? object.coupon[0].code : '',
    shippingCost: object.shipping_cost_customer
      .toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })
      .replace('.', ','),
    shipAddress: object.shipping_address.address,
    shipNumber: object.shipping_address.number,
    shipFloor: object.shipping_address.floor,
    shipLocality: object.shipping_address.locality,
    shipCity: object.shipping_address.city,
    shipProvince: object.shipping_address.province,
    shipCountry: object.shipping_address.country,
    shipZip: object.shipping_address.zipcode,
    paymentStatus: object.payment_status,
    payDate: object.paid_at || '',
    shipStatus: object.shipping_status,
    shipDate: object.shipped_at || '',
    orderId: object.id,
    shipped:
      objectShip && objectShip.results[0].timestamps.shipped_at
        ? new Date(objectShip.results[0].timestamps.shipped_at)
            .toLocaleString('es-AR', {
              timeZone: 'America/Argentina/Buenos_Aires',
            })
            .replace(',', '')
        : '',
    snStatus:
      objectShip && objectShip.results[0].status
        ? objectShip.results[0].status
        : '',
    deliveredAt:
      objectShip && objectShip.results[0].timestamps.delivered_at
        ? new Date(objectShip.results[0].timestamps.delivered_at)
            .toLocaleString('es-AR', {
              timeZone: 'America/Argentina/Buenos_Aires',
            })
            .replace(',', '')
        : '',
    mpCost: mpCost ? mpCost : '',
    iva: iva ? iva : '',
    ganancias: ganancias ? ganancias : '',
    sirtac: sirtac ? sirtac : '',
    otrosImp: otrosImp ? otrosImp : '',
    tiendaFee: tiendaFee ? tiendaFee : '',
    dateReleased: dateReleased ? dateReleased : '',
    cuotas: cuotas ? cuotas : '',
    received: received ? received : '',
  }

  if (order.shipStatus === 'not_delivered') {
    addRebotado(order.number)
  }
  return order
}
