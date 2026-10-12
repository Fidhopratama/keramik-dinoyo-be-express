require('dotenv').config()

const sequelize = require('../src/config/database')

async function testAuditLogs() {
  try {
    await sequelize.authenticate()

    const [results] = await sequelize.query(
      'SHOW COLUMNS FROM audit_logs',
    )

    console.table(results)
  } catch (error) {
    console.error(
      'Gagal membaca tabel audit_logs:',
      error.message,
    )
  } finally {
    await sequelize.close()
  }
}

testAuditLogs()