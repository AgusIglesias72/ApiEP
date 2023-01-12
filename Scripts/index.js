import { getOrdersFromGoogle, PostOrdersToMeli } from '../DB/index.js'

await getOrdersFromGoogle()

await PostOrdersToMeli()
