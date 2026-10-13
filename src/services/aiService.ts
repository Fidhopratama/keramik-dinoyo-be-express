const axios = require('axios')
import type { AxiosError } from 'axios'

interface AnalyzeCeramicPreferenceParams {
  userId?: number | null
  preferences: Record<string, unknown>
}

async function analyzeCeramicPreference({
  userId = null,
  preferences,
}: AnalyzeCeramicPreferenceParams): Promise<unknown> {
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
  } catch (error: unknown) {
    const axiosError = error as AxiosError

    const errorDetails =
      axiosError.response?.data ??
      (error instanceof Error ? error.message : String(error))

    console.error(
      'AI service error:',
      errorDetails,
    )

    throw new Error(
      'Layanan AI sedang tidak dapat digunakan.',
    )
  }
}

module.exports = {
  analyzeCeramicPreference,
}