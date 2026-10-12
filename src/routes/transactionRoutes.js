const express = require('express')

const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController')

const authenticateToken = require('../middleware/auth')
const authorizeRole = require('../middleware/authorizeRole')

const router = express.Router()

// User yang sudah login
router.get(
  '/transactions',
  authenticateToken,
  getTransactions,
)

router.get(
  '/transactions/:id',
  authenticateToken,
  getTransactionById,
)

// Customer dan admin boleh membuat transaksi
router.post(
  '/transactions',
  authenticateToken,
  createTransaction,
)

// Admin only untuk mengubah status/data transaksi
router.put(
  '/transactions/:id',
  authenticateToken,
  authorizeRole('admin'),
  updateTransaction,
)

// Admin only untuk menghapus transaksi
router.delete(
  '/transactions/:id',
  authenticateToken,
  authorizeRole('admin'),
)

module.exports = router