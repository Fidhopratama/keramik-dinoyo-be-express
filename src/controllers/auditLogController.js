const { AuditLog, User } = require('../models')

async function getAuditLogs(req, res) {
  try {
    const logs = await AuditLog.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['id', 'DESC']],
    })

    return res.json({
      success: true,
      data: logs,
    })
  } catch (error) {
    console.error('Get audit logs error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil audit log.',
    })
  }
}

async function getAuditLogById(req, res) {
  try {
    const log = await AuditLog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    })

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log tidak ditemukan.',
      })
    }

    return res.json({
      success: true,
      data: log,
    })
  } catch (error) {
    console.error('Get audit log detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail audit log.',
    })
  }
}

module.exports = {
  getAuditLogs,
  getAuditLogById,
}