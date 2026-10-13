import express from 'express'
import multer from 'multer'
import type { Request } from 'express'
import type { FileFilterCallback } from 'multer'
import type { StorageEngine } from 'multer'
import path from 'path'
import fs from 'fs'

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

const storage: StorageEngine = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, uploadDir)
  },

  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const ext = path.extname(file.originalname)

    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
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

  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.mimetype)) {
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