import express from 'express'
import path from 'path'
import { createImageUpload } from '../middleware/imageUpload'

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

const authenticateToken = require('../middleware/auth')
const authorizeRole = require('../middleware/authorizeRole')

const router = express.Router()

const upload = createImageUpload(
  path.join(process.cwd(), 'uploads', 'products'),
  'product',
)

// Public
router.get('/products', getProducts)
router.get('/products/:id', getProductById)

// Admin only
router.post(
  '/products',
  authenticateToken,
  authorizeRole('admin'),
  upload.single('image'),
  createProduct,
)

router.put(
  '/products/:id',
  authenticateToken,
  authorizeRole('admin'),
  upload.single('image'),
  updateProduct,
)

router.delete(
  '/products/:id',
  authenticateToken,
  authorizeRole('admin'),
  deleteProduct,
)

module.exports = router