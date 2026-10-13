
import type {
  Request,
  Response,
  NextFunction,
} from 'express'

const jwt = require('jsonwebtoken')

interface AuthenticatedUser {
  userId: number
  roleId?: number
  role?: string
  [key: string]: unknown
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}

interface JwtPayload {
  userId: number
  roleId?: number
  role?: string
  [key: string]: unknown
}

function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void | Response {
  const authHeader = req.headers.authorization

  if (
    !authHeader ||
    !authHeader.startsWith('Bearer ')
  ) {
    return res.status(401).json({
      success: false,
      message: 'Token autentikasi diperlukan.',
    })
  }

  const token = authHeader.split(' ')[1]
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    console.error('JWT_SECRET belum dikonfigurasi.')

    return res.status(500).json({
      success: false,
      message: 'Konfigurasi autentikasi tidak tersedia.',
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      jwtSecret,
    ) as JwtPayload

    ;(req as AuthenticatedRequest).user = decoded

    next()
  } catch (error: unknown) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kedaluwarsa.',
    })
  }
}

module.exports = authenticateToken