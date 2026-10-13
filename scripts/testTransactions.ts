
import 'dotenv/config'

const sequelize = require('../src/config/database')

async function testTransactions(): Promise<void> {
  try {
    await sequelize.authenticate()

    const [results] = await sequelize.query(
      'SHOW COLUMNS FROM transactions',
    )

    console.table(results)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error)

    console.error(
      'Gagal membaca tabel transactions:',
      message,
    )
  } finally {
    await sequelize.close()
  }
}

testTransactions()