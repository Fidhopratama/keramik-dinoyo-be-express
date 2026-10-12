const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, Role } = require('../models')

async function login(req, res) {
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

    const passwordValid = await bcrypt.compare(
      password,
      user.password,
    )

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.role_id,
        role: user.role?.name || null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      },
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
  } catch (error) {
    console.error('Login error:', error)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
}

async function me(req, res) {
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
  } catch (error) {
    console.error('Me error:', error)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
}

async function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logout berhasil.',
  })
}

module.exports = {
  login,
  me,
  logout,
}