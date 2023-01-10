import { getOrdersFromGoogle, PostOrdersToMeli } from '../DB'

await getOrdersFromGoogle()

await PostOrdersToMeli('2023-01-01')
