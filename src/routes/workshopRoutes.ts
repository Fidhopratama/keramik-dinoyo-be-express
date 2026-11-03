
import express from 'express'
import path from 'path'
import { createImageUpload } from '../middleware/imageUpload'

const {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
} = require('../controllers/workshopController')

const authenticateToken = require('../middleware/auth')
const authorizeRole = require('../middleware/authorizeRole')

const router = express.Router()

const upload = createImageUpload(
  path.join(process.cwd(), 'uploads', 'workshops'),
  'workshop',
)

// Public
router.get('/workshops', getWorkshops)
router.get('/workshops/:id', getWorkshopById)

// Admin only
router.post(
  '/workshops',
  authenticateToken,
  authorizeRole('admin'),
  upload.single('image'),
  createWorkshop,
)

router.put(
  '/workshops/:id',
  authenticateToken,
  authorizeRole('admin'),
  upload.single('image'),
  updateWorkshop,
)

router.delete(
  '/workshops/:id',
  authenticateToken,
  authorizeRole('admin'),
  deleteWorkshop,
)

module.exports = router