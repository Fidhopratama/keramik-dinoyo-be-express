import type { Request, Response } from 'express'
import {
  CloudinaryConfigurationError,
  createCloudinaryUploadSignature,
} from '../services/cloudinaryUpload'

const express = require('express')
const authenticateToken = require('../middleware/auth')
const authorizeRole = require('../middleware/authorizeRole')

const router = express.Router()

function createUploadSignature(_req: Request, res: Response): Response {
  try {
    return res.json({
      success: true,
      data: createCloudinaryUploadSignature(),
    })
  } catch (error: unknown) {
    if (error instanceof CloudinaryConfigurationError) {
      return res.status(503).json({
        success: false,
        message: error.message,
      })
    }

    console.error('Cloudinary upload signature generation failed.')
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat signature upload.',
    })
  }
}

router.post(
  '/uploads/cloudinary-signature',
  authenticateToken,
  authorizeRole('admin'),
  createUploadSignature,
)

module.exports = router
