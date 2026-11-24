
import cors from 'cors'
import type { NextFunction, Request, Response } from 'express'

function parseFrontendOrigins(value: string | undefined): string[] {
  if (!value) return []

  const origins = new Set<string>()

  for (const entry of value.split(',')) {
    const candidate = entry.trim()
    if (!candidate) continue

    try {
      const url = new URL(candidate)

      if (
        (url.protocol === 'https:' || url.protocol === 'http:') &&
        url.username === '' &&
        url.password === '' &&
        url.pathname === '/' &&
        url.search === '' &&
        url.hash === ''
      ) {
        origins.add(url.origin)
      }
    } catch {
      continue
    }
  }

  return [...origins]
}

function isVercelPreviewOrigin(origin: string): boolean {
  return /^https:\/\/keramik-dinoyo-fe-next-[a-z0-9]+-fidhopratamas-projects\.vercel\.app$/.test(
    origin,
  )
}

export function createFrontendCorsMiddleware(
  frontendOrigin =
    process.env.FRONTEND_ORIGIN ??
    (process.env.NODE_ENV === 'production'
      ? undefined
      : 'http://localhost:3000,http://127.0.0.1:3000'),
) {
  const allowedOrigins = parseFrontendOrigins(frontendOrigin)

  const isAllowedOrigin = (origin: string): boolean => {
    return (
      allowedOrigins.includes(origin) ||
      isVercelPreviewOrigin(origin)
    )
  }

  const corsMiddleware = cors({
    origin: (origin, callback) => {
      callback(null, Boolean(origin && isAllowedOrigin(origin)))
    },
    credentials: true,
  })

  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void | Response => {
    const origin = req.get('Origin')

    if (!origin) return next()

    if (!isAllowedOrigin(origin)) {
      return res.status(403).json({
        success: false,
        message: 'Origin tidak diizinkan.',
      })
    }

    return corsMiddleware(req, res, next)
  }
}

export default createFrontendCorsMiddleware()
