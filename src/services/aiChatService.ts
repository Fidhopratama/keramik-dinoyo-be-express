import axios, { type AxiosError } from 'axios'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWithDinoyoAiParams {
  message: string
  conversationId: string
  history: ChatMessage[]
}

async function chatWithDinoyoAi({
  message,
  conversationId,
  history,
}: ChatWithDinoyoAiParams): Promise<unknown> {
  const serviceUrl = (
    process.env.AI_SERVICE_URL || 'http://127.0.0.1:3000'
  ).replace(/\/+$/, '')
  const serviceToken = process.env.AI_SERVICE_TOKEN

  if (!serviceToken) {
    throw new Error('AI_SERVICE_TOKEN belum dikonfigurasi di backend.')
  }

  try {
    const response = await axios.post(
      `${serviceUrl}/ai/chat`,
      { message, conversation_id: conversationId, history },
      {
        timeout: 45_000,
        headers: { Authorization: `Bearer ${serviceToken}` },
      },
    )

    return response.data
  } catch (error: unknown) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status
    console.error('Dinoyo AI service request failed:', status ?? 'network error')
    throw new Error('Dinoyo AI sedang tidak dapat dihubungi. Coba lagi nanti.')
  }
}

module.exports = { chatWithDinoyoAi }
