const express = require('express')

const {
  getDashboard,
} = require('../controllers/dashboardController')

const authenticateToken = require('../middleware/auth')
const authorizeRole = require('../middleware/authorizeRole')

const router = express.Router()

router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole('admin'),
  getDashboard,
)

module.exports = router