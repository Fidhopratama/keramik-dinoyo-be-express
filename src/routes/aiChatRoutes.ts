const express = require('express')
const authenticateToken = require('../middleware/auth')
const aiChatRateLimit = require('../middleware/aiChatRateLimit')
const { chat } = require('../controllers/aiChatController')

const router = express.Router()

router.post('/ai/chat', authenticateToken, aiChatRateLimit, chat)

module.exports = router
