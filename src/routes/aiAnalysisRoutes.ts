const express = require('express')

const {
  getAiAnalysisResults,
  getAiAnalysisResultById,
} = require('../controllers/aiAnalysisController')

const authenticateToken = require('../middleware/auth')
const authorizeRole = require('../middleware/authorizeRole')

const router = express.Router()

// Admin only
router.get(
  '/ai/analysis-results',
  authenticateToken,
  authorizeRole('admin'),
  getAiAnalysisResults,
)

router.get(
  '/ai/analysis-results/:id',
  authenticateToken,
  authorizeRole('admin'),
  getAiAnalysisResultById,
)

module.exports = router