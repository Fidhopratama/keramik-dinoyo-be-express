const express = require('express')

const {
  getAuditLogs,
  getAuditLogById,
} = require('../controllers/auditLogController')

const authenticateToken = require('../middleware/auth')
const authorizeRole = require('../middleware/authorizeRole')

const router = express.Router()

// Admin only
router.get(
  '/audit-logs',
  authenticateToken,
  authorizeRole('admin'),
  getAuditLogs,
)

router.get(
  '/audit-logs/:id',
  authenticateToken,
  authorizeRole('admin'),
  getAuditLogById,
)

module.exports = router