require('dotenv').config()

const sequelize = require('../src/config/database')

async function testAiAnalysisResults() {
  try {
    await sequelize.authenticate()

    const [results] = await sequelize.query(
      'SHOW COLUMNS FROM ai_analysis_results',
    )

    console.table(results)
  } catch (error) {
    console.error(
      'Gagal membaca tabel ai_analysis_results:',
      error.message,
    )
  } finally {
    await sequelize.close()
  }
}

testAiAnalysisResults()