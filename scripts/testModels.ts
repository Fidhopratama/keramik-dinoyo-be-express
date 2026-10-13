require('dotenv').config()

const {
  Product,
  Shop,
  Category,
  Workshop,
} = require('../src/models')

console.log('Product:', !!Product)
console.log('Shop:', !!Shop)
console.log('Category:', !!Category)
console.log('Workshop:', !!Workshop)

process.exit(0)