import express from 'express'
import path from 'path'
import { createImageUpload } from '../middleware/imageUpload'

const {
  getShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
} = require('../controllers/shopController')

const authenticateToken = require('../middleware/auth')
const authorizeRole = require('../middleware/authorizeRole')

const router = express.Router()

const upload = createImageUpload(
  path.join(process.cwd(), 'uploads', 'shops'),
  'shop',
)

// Public
router.get('/shops', getShops)
router.get('/shops/:id', getShopById)

// Admin only
router.post(
  '/shops',
  authenticateToken,
  authorizeRole('admin'),
  upload.single('image'),
  createShop,
)

router.put(
  '/shops/:id',
  authenticateToken,
  authorizeRole('admin'),
  upload.single('image'),
  updateShop,
)

router.delete(
  '/shops/:id',
  authenticateToken,
  authorizeRole('admin'),
  deleteShop,
)

module.exports = router