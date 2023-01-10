import { getOrdersFromGoogle, PostOrdersToMeli } from '../DB/index.js'

await getOrdersFromGoogle()

await PostOrdersToMeli('2023-01-01')
