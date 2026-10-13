
import 'dotenv/config'

const sequelize = require('../src/config/database')

async function testTransactionItems(): Promise<void> {
  try {
    await sequelize.authenticate()

    const [results] = await sequelize.query(
      'SHOW COLUMNS FROM transaction_items',
    )

    console.table(results)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error)

    console.error(
      'Gagal membaca tabel transaction_items:',
      message,
    )
  } finally {
    await sequelize.close()
  }
}

testTransactionItems()