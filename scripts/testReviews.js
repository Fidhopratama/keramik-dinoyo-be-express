require('dotenv').config()

const sequelize = require('../src/config/database')

async function testReviews() {
  try {
    await sequelize.authenticate()

    const [results] = await sequelize.query(
      'SHOW COLUMNS FROM reviews',
    )

    console.table(results)
  } catch (error) {
    console.error(
      'Gagal membaca tabel reviews:',
      error.message,
    )
  } finally {
    await sequelize.close()
  }
}

testReviews()