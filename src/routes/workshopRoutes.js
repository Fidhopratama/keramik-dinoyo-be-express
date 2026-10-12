const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

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

const uploadDir = path.join(process.cwd(), 'uploads', 'workshops')

fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)

    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()

    cb(
      null,
      `${Date.now()}-${baseName || 'workshop'}${ext.toLowerCase()}`,
    )
  },
})

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ]

    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error(
          'File gambar harus berupa JPG, JPEG, PNG, atau WEBP.',
        ),
      )
    }

    cb(null, true)
  },
})

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