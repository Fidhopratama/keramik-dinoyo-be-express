const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

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

const uploadDir = path.join(
  process.cwd(),
  'uploads',
  'shops',
)

fs.mkdirSync(uploadDir, {
  recursive: true,
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const ext = path.extname(
      file.originalname,
    )

    const safeName = path
      .basename(
        file.originalname,
        ext,
      )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        '-',
      )
      .replace(
        /-+/g,
        '-',
      )
      .toLowerCase()

    cb(
      null,
      `${Date.now()}-${safeName || 'shop'}${ext.toLowerCase()}`,
    )
  },
})

const upload = multer({
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]

    if (
      !allowedTypes.includes(
        file.mimetype,
      )
    ) {
      return cb(
        new Error(
          'Format gambar harus JPG, PNG, atau WEBP.',
        ),
      )
    }

    cb(null, true)
  },
})

// Public
router.get(
  '/shops',
  getShops,
)

router.get(
  '/shops/:id',
  getShopById,
)

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