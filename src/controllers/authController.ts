import type { Request, Response } from 'express'

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, Role } = require('../models')
interface AuthenticatedRequest extends Request {
  user: {
    userId: number
    roleId?: number
    role?: string | null
  }
}

interface LoginBody {
  email?: string
  password?: string
}

export async function login(
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<Response> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      })
    }

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      })
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Akun tidak aktif.',
      })
    }

    const passwordValid: boolean = await bcrypt.compare(
      password,
      user.password
    )

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      })
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      console.error('JWT_SECRET belum dikonfigurasi.')

      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server.',
      })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.role_id,
        role: user.role?.name ?? null,
      },
      jwtSecret,
      {
        expiresIn: '7d',
      } 
    )

    return res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: {
          id: user.id,
          role_id: user.role_id,
          name: user.name,
          email: user.email,
          is_active: user.is_active,
          role: user.role
            ? {
                id: user.role.id,
                name: user.role.name,
                description: user.role.description,
              }
            : null,
        },
      },
    })
  } catch (error: unknown) {
    console.error('Login error:', error)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
}

export async function me(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: [
        'id',
        'role_id',
        'name',
        'email',
        'is_active',
      ],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.',
      })
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Akun tidak aktif.',
      })
    }

    return res.json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error: unknown) {
    console.error('Me error:', error)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
}

export async function logout(
  _req: Request,
  res: Response
): Promise<Response> {
  return res.json({
    success: true,
    message: 'Logout berhasil.',
  })
}