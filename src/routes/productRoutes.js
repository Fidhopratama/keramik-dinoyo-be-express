const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

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

const uploadDir = path.join(
  process.cwd(),
  'uploads',
  'products',
)

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const ext = path.extname(
      file.originalname,
    )

    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase()

    cb(
      null,
      `${Date.now()}-${safeName}${ext.toLowerCase()}`,
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
  '/products',
  getProducts,
)

router.get(
  '/products/:id',
  getProductById,
)

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