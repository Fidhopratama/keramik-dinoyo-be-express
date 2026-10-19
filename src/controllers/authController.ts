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

interface RegisterBody {
  name?: string
  email?: string
  password?: string
}

interface LoginBody {
  email?: string
  password?: string
}

function createToken(user: any): string | null {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return null
  }

  return jwt.sign(
    {
      userId: user.id,
      roleId: user.role_id,
      role: user.role?.name ?? null,
    },
    jwtSecret,
    { expiresIn: '7d' },
  )
}

function userPayload(user: any) {
  return {
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
  }
}

export async function register(
  req: Request<{}, {}, RegisterBody>,
  res: Response,
): Promise<Response> {
  try {
    const name = req.body.name?.trim()
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password

    if (!name || !email || !password) {
      return res.status(422).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi.',
      })
    }

    if (name.length > 255) {
      return res.status(422).json({
        success: false,
        message: 'Nama maksimal 255 karakter.',
      })
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(email)) {
      return res.status(422).json({
        success: false,
        message: 'Format email tidak valid.',
      })
    }

    if (password.length < 8) {
      return res.status(422).json({
        success: false,
        message: 'Password minimal 8 karakter.',
      })
    }

    const existingUser = await User.findOne({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar.',
      })
    }

    // Gunakan role yang memang tersedia di tabel Roles.
    const userRole = await Role.findOne({
      where: { name: 'customer' },
    })

    if (!userRole) {
      console.error(
        'Role customer tidak ditemukan di tabel Roles.',
      )

      return res.status(500).json({
        success: false,
        message: 'Role customer belum dikonfigurasi di server.',
      })
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      console.error('JWT_SECRET belum dikonfigurasi.')
      return res.status(500).json({
        success: false,
        message: 'Konfigurasi autentikasi server belum lengkap.',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role_id: userRole.id,
      is_active: true,
    })

    const createdUser = await User.findByPk(user.id, {
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

    if (!createdUser) {
      return res.status(500).json({
        success: false,
        message: 'Akun dibuat, tetapi data pengguna gagal dibaca.',
      })
    }

    const token = createToken(createdUser)

    if (!token) {
      return res.status(500).json({
        success: false,
        message: 'Akun dibuat, tetapi sesi login gagal dibuat.',
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil.',
      data: {
        token,
        user: userPayload(createdUser),
      },
    })
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar.',
      })
    }

    console.error('Register error:', error)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
}

export async function login(
  req: Request<{}, {}, LoginBody>,
  res: Response,
): Promise<Response> {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password

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
      user.password,
    )

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      })
    }

    const token = createToken(user)

    if (!token) {
      console.error('JWT_SECRET belum dikonfigurasi.')

      return res.status(500).json({
        success: false,
        message: 'Konfigurasi autentikasi server belum lengkap.',
      })
    }

    return res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: userPayload(user),
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
}

export async function me(
  req: AuthenticatedRequest,
  res: Response,
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
        user: userPayload(user),
      },
    })
  } catch (error: any) {
    console.error('Me error:', error)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
}

export async function logout(
  _req: Request,
  res: Response,
): Promise<Response> {
  return res.json({
    success: true,
    message: 'Logout berhasil.',
  })
}
