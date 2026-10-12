const {
  AiAnalysisResult,
} = require('../models')

const {
  analyzeCeramicPreference,
} = require('../services/aiService')

async function ceramicFinder(req, res) {
  try {
    const {
      preferences,
    } = req.body

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

    const aiResult = await analyzeCeramicPreference({
      userId,
      preferences,
    })

    if (
      !aiResult ||
      aiResult.success === false
    ) {
      return res.status(502).json({
        success: false,
        message: 'AI gagal memberikan rekomendasi.',
      })
    }

    const resultData =
      aiResult.data || aiResult

    const savedResult =
      await AiAnalysisResult.create({
        user_id: userId,
        feature: 'ceramic_finder',
        input_data: JSON.stringify(preferences),
        category:
          resultData.category || null,
        reason:
          resultData.reason || null,
        suggestions:
          resultData.suggestions || [],
        model:
          resultData.model || null,
        status: 'success',
      })

    return res.json({
      success: true,
      message: 'Rekomendasi keramik berhasil dibuat.',
      data: {
        analysis_id: savedResult.id,
        category:
          resultData.category || null,
        reason:
          resultData.reason || null,
        suggestions:
          resultData.suggestions || [],
        model:
          resultData.model || null,
      },
    })
  } catch (error) {
    console.error(
      'Ceramic finder error:',
      error,
    )

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Gagal memproses rekomendasi keramik.',
    })
  }
}

module.exports = {
  ceramicFinder,
}