import {
  getOrdersFromGoogle,
  PostOrdersToMeli,
  PostOrdersToTN,
} from '../DB/index.js'

await getOrdersFromGoogle()

await PostOrdersToMeli()

// await PostOrdersToTN()
