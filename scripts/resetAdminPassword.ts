import 'dotenv/config'

const bcrypt = require('bcrypt')
const sequelize = require('../src/config/database')
const { User } = require('../src/models')

async function resetAdminPassword(): Promise<void> {
  try {
    await sequelize.authenticate()

    const newPassword = 'password'

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12,
    )

    const [updatedRows] = await User.update(
      {
        password: hashedPassword,
      },
      {
        where: {
          email: 'admin@keramikdinoyo.test',
        },
      },
    )

    if (updatedRows === 0) {
      console.log('User admin tidak ditemukan.')
      return
    }

    console.log('Password admin berhasil di-reset.')
    console.log('Email: admin@keramikdinoyo.test')
    console.log('Password: password')
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error)

    console.error(
      'Gagal reset password:',
      message,
    )
  } finally {
    await sequelize.close()
  }
}

resetAdminPassword()