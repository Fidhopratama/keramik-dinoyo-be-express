require('dotenv').config()

const sequelize = require('../src/config/database')

async function testWorkshops() {
  try {
    await sequelize.authenticate()

    const [results] = await sequelize.query(
      'SHOW COLUMNS FROM workshops',
    )

    console.table(results)
  } catch (error) {
    console.error(
      'Gagal membaca tabel workshops:',
      error.message,
    )
  } finally {
    await sequelize.close()
  }
}

testWorkshops()