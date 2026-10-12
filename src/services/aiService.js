const axios = require('axios')

async function analyzeCeramicPreference({
  userId = null,
  preferences,
}) {
  try {
    const aiServiceUrl =
      process.env.AI_SERVICE_URL ||
      'http://127.0.0.1:3000'

    const response = await axios.post(
      `${aiServiceUrl}/api/ai/ceramic-finder`,
      {
        user_id: userId,
        preferences,
      },
      {
        timeout: 30000,
      },
    )

    return response.data
  } catch (error) {
    console.error(
      'AI service error:',
      error.response?.data || error.message,
    )

    throw new Error(
      'Layanan AI sedang tidak dapat digunakan.',
    )
  }
}

module.exports = {
  analyzeCeramicPreference,
}