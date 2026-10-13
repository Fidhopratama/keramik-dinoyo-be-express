import type { Request, Response } from 'express'

const { AuditLog, User } = require('../models')
export async function getAuditLogs(
  req: Request,
  res: Response
): Promise<Response> {
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
  } catch (error: unknown) {
    console.error('Get audit logs error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil audit log.',
    })
  }
}

export async function getAuditLogById(
  req: Request,
  res: Response
): Promise<Response> {
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
  } catch (error: unknown) {
    console.error('Get audit log detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail audit log.',
    })
  }
}