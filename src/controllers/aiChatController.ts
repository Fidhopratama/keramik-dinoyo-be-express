import type { Request, Response } from 'express'

const { chatWithDinoyoAi } = require('../services/aiChatService')
const { randomUUID } = require('crypto')

interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

interface ChatBody {
  message?: unknown
  conversation_id?: unknown
  history?: unknown
}

function parseHistory(value: unknown): ChatTurn[] | null {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length > 20) return null

  const turns: ChatTurn[] = []
  for (const item of value) {
    if (
      !item ||
      typeof item !== 'object' ||
      (item.role !== 'user' && item.role !== 'assistant') ||
      typeof item.content !== 'string' ||
      !item.content.trim() ||
      item.content.length > 1200
    ) {
      return null
    }
    turns.push({ role: item.role, content: item.content.trim() })
  }
  return turns.slice(-8)
}

async function chat(
  req: Request<{}, unknown, ChatBody>,
  res: Response,
): Promise<Response> {
  const rawMessage = req.body?.message
  const message = typeof rawMessage === 'string' ? rawMessage.trim() : ''
  if (!message || message.length > 1200) {
    return res.status(422).json({
      success: false,
      message: 'Pesan wajib diisi dan maksimal 1200 karakter.',
    })
  }

  const rawConversationId = req.body?.conversation_id
  if (
    rawConversationId !== undefined &&
    rawConversationId !== null &&
    (typeof rawConversationId !== 'string' || rawConversationId.length > 100)
  ) {
    return res.status(422).json({
      success: false,
      message: 'conversation_id tidak valid.',
    })
  }

  const history = parseHistory(req.body?.history)
  if (!history) {
    return res.status(422).json({
      success: false,
      message: 'Riwayat percakapan tidak valid.',
    })
  }

  const conversationId =
    typeof rawConversationId === 'string' && rawConversationId.trim()
      ? rawConversationId.trim()
      : randomUUID()

  try {
    const result: any = await chatWithDinoyoAi({
      message,
      conversationId,
      history,
    })

    const data = result?.data
    if (
      result?.success !== true ||
      typeof data?.reply !== 'string' ||
      !data.reply.trim()
    ) {
      return res.status(502).json({
        success: false,
        message: 'Dinoyo AI belum dapat memberikan jawaban. Coba lagi.',
      })
    }

    const suggestions = Array.isArray(data.suggestions)
      ? data.suggestions
          .filter((item: unknown) => typeof item === 'string')
          .map((item: string) => item.trim().slice(0, 120))
          .filter((item: string) => item.length > 0)
          .slice(0, 3)
      : []

    return res.json({
      success: true,
      data: {
        conversation_id: conversationId,
        reply: data.reply.trim().slice(0, 6000),
        suggestions,
      },
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Dinoyo AI sedang tidak dapat digunakan.'
    const statusCode = message.includes('tidak dapat dihubungi') ||
        message.includes('belum dikonfigurasi')
      ? 503
      : 500

    console.error('Dinoyo AI chat failed:', statusCode)
    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 503
          ? 'Dinoyo AI sedang tidak tersedia. Coba lagi nanti.'
          : 'Pesan belum dapat diproses. Coba lagi.',
    })
  }
}

module.exports = { chat }
