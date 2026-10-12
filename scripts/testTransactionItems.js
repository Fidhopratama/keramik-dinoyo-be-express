require('dotenv').config()

const sequelize = require('../src/config/database')

async function testTransactionItems() {
  try {
    await sequelize.authenticate()

    const [results] = await sequelize.query(
      'SHOW COLUMNS FROM transaction_items',
    )

    console.table(results)
  } catch (error) {
    console.error(
      'Gagal membaca tabel transaction_items:',
      error.message,
    )
  } finally {
    await sequelize.close()
  }
}

testTransactionItems()