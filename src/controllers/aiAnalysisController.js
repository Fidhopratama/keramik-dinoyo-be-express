const { AiAnalysisResult, User } = require('../models')

async function getAiAnalysisResults(req, res) {
  try {
    const results = await AiAnalysisResult.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['id', 'DESC']],
    })

    return res.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('Get AI analysis results error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil hasil analisis AI.',
    })
  }
}

async function getAiAnalysisResultById(req, res) {
  try {
    const result = await AiAnalysisResult.findByPk(
      req.params.id,
      {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
        ],
      },
    )

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Hasil analisis AI tidak ditemukan.',
      })
    }

    return res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error(
      'Get AI analysis result detail error:',
      error,
    )

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail hasil analisis AI.',
    })
  }
}

module.exports = {
  getAiAnalysisResults,
  getAiAnalysisResultById,
}