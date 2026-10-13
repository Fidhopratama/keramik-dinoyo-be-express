
import type { Request, Response } from 'express'

const { AiAnalysisResult } = require('../models')

const {
  analyzeCeramicPreference,
} = require('../services/aiService')

interface CeramicFinderBody {
  preferences?: Record<string, unknown>
}

interface AuthenticatedUser {
  userId: number
}

interface AuthenticatedRequest<
  B = unknown,
> extends Request<Record<string, never>, unknown, B> {
  user: AuthenticatedUser
}

interface CeramicAnalysisResult {
  category?: string | null
  reason?: string | null
  suggestions?: unknown[]
  model?: string | null
}

interface AiAnalysisResponse {
  success?: boolean
  data?: CeramicAnalysisResult
  category?: string | null
  reason?: string | null
  suggestions?: unknown[]
  model?: string | null
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'Gagal memproses rekomendasi keramik.'
}

async function ceramicFinder(
  req: AuthenticatedRequest<CeramicFinderBody>,
  res: Response,
): Promise<Response> {
  try {
    const { preferences } = req.body

    if (
      !preferences ||
      typeof preferences !== 'object' ||
      Array.isArray(preferences)
    ) {
      return res.status(422).json({
        success: false,
        message: 'Preferences wajib berupa object.',
      })
    }

    const userId = req.user.userId

    const aiResult: AiAnalysisResponse =
      await analyzeCeramicPreference({
        userId,
        preferences,
      })

    if (!aiResult || aiResult.success === false) {
      return res.status(502).json({
        success: false,
        message: 'AI gagal memberikan rekomendasi.',
      })
    }

    const resultData: CeramicAnalysisResult =
      aiResult.data || aiResult

    const category = resultData.category || null
    const reason = resultData.reason || null
    const suggestions = resultData.suggestions || []
    const model = resultData.model || null

    const savedResult = await AiAnalysisResult.create({
      user_id: userId,
      feature: 'ceramic_finder',
      input_data: JSON.stringify(preferences),
      category,
      reason,
      suggestions,
      model,
      status: 'success',
    })

    return res.json({
      success: true,
      message: 'Rekomendasi keramik berhasil dibuat.',
      data: {
        analysis_id: savedResult.id,
        category,
        reason,
        suggestions,
        model,
      },
    })
  } catch (error: unknown) {
    console.error('Ceramic finder error:', error)

    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    })
  }
}

module.exports = {
  ceramicFinder,
}