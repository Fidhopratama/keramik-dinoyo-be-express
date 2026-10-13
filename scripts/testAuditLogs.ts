
import 'dotenv/config'

const sequelize = require('../src/config/database')

async function testAuditLogs(): Promise<void> {
  try {
    await sequelize.authenticate()

    const [results] = await sequelize.query(
      'SHOW COLUMNS FROM audit_logs',
    )

    console.table(results)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error)

    console.error(
      'Gagal membaca tabel audit_logs:',
      message,
    )
  } finally {
    await sequelize.close()
  }
}

testAuditLogs()