const express = require('express')

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController')

const authenticateToken = require('../middleware/auth')
const authorizeRole = require('../middleware/authorizeRole')

const router = express.Router()

// Public
router.get('/categories', getCategories)
router.get('/categories/:id', getCategoryById)

// Admin only
router.post(
  '/categories',
  authenticateToken,
  authorizeRole('admin'),
  createCategory,
)

router.put(
  '/categories/:id',
  authenticateToken,
  authorizeRole('admin'),
  updateCategory,
)

router.delete(
  '/categories/:id',
  authenticateToken,
  authorizeRole('admin'),
  deleteCategory,
)

module.exports = router