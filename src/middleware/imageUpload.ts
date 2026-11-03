import fs from 'fs'
import multer from 'multer'
import path from 'path'
import type { Request } from 'express'
import type {
  ErrorRequestHandler,
} from 'express'
import type { FileFilterCallback } from 'multer'
import type { StorageEngine } from 'multer'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const allowedMimeTypes: Record<string, string[]> = {
  '.jpg': ['image/jpeg', 'image/jpg'],
  '.jpeg': ['image/jpeg', 'image/jpg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
}

export class InvalidImageTypeError extends Error {
  constructor() {
    super('File harus berupa gambar JPG, JPEG, PNG, atau WEBP.')
    this.name = 'InvalidImageTypeError'
  }
}

export function createImageUpload(
  uploadDir: string,
  fallbackName: string,
): multer.Multer {
  fs.mkdirSync(uploadDir, { recursive: true })

  const storage: StorageEngine = multer.diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => cb(null, uploadDir),
    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const safeName = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()

      cb(null, `${Date.now()}-${safeName || fallbackName}${ext}`)
    },
  })

  return multer({
    storage,
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback,
    ) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const acceptedMimeTypes = allowedMimeTypes[ext]

      if (!acceptedMimeTypes?.includes(file.mimetype.toLowerCase())) {
        return cb(new InvalidImageTypeError())
      }

      cb(null, true)
    },
  })
}

export function removeUploadedImage(
  directory: string,
  filename: string,
): void {
  const filePath = path.join(
    process.cwd(),
    'uploads',
    directory,
    path.basename(filename),
  )

  try {
    fs.unlinkSync(filePath)
  } catch (error: unknown) {
    console.error('Remove uploaded image error:', error)
  }
}

export const imageUploadErrorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'Ukuran gambar maksimal 5 MB.',
      })
    }

    return res.status(400).json({
      success: false,
      message: 'Upload gambar tidak valid.',
    })
  }

  if (error instanceof InvalidImageTypeError) {
    return res.status(422).json({
      success: false,
      message: error.message,
    })
  }

  return next(error)
}
