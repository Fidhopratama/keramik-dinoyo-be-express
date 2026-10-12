const app = require('./app')
const sequelize = require('./config/database')
const { Role, User } = require('./models')

const PORT = process.env.PORT || 5050

async function startServer() {
  try {
    await sequelize.authenticate()

    console.log('MySQL berhasil terhubung.')

    const roles = await Role.findAll({
      attributes: ['id', 'name'],
      order: [['id', 'ASC']],
    })

    console.log('Roles:', roles.map((role) => role.toJSON()))

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role_id'],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name'],
        },
      ],
      order: [['id', 'ASC']],
    })

    console.log(
      'Users:',
      users.map((user) => user.toJSON()),
    )

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Keramik Dinoyo API berjalan di http://localhost:${PORT}`,
      )
    })
  } catch (error) {
    console.error(
      'Gagal menjalankan server:',
      error.message,
    )

    process.exit(1)
  }
}

startServer()