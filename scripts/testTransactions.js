require('dotenv').config()

const sequelize = require('../src/config/database')

async function testTransactions() {
  try {
    await sequelize.authenticate()

    const [results] = await sequelize.query(
      'SHOW COLUMNS FROM transactions',
    )

    console.table(results)
  } catch (error) {
    console.error(
      'Gagal membaca tabel transactions:',
      error.message,
    )
  } finally {
    await sequelize.close()
  }
}

testTransactions()