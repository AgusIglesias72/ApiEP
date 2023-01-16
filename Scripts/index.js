import {
  getOrdersFromGoogle,
  PostOrdersToMeli,
  PostOrdersToTN,
} from '../DB/index.js'

console.log('Get Orders')

await getOrdersFromGoogle()

console.log('Mercado Libre')

await PostOrdersToMeli()

console.log('Tienda Nube')

await PostOrdersToTN()
