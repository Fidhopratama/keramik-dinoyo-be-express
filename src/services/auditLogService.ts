
import type { Request } from 'express'

const { AuditLog } = require('../models')

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: number
  }
}

interface CreateAuditLogParams {
  req?: AuthenticatedRequest | null
  userId?: number | null
  action: string
  entityType?: string | null
  entityId?: number | null
  oldValues?: unknown
  newValues?: unknown
}

async function createAuditLog({
  req,
  userId = null,
  action,
  entityType = null,
  entityId = null,
  oldValues = null,
  newValues = null,
}: CreateAuditLogParams): Promise<void> {
  try {
    const forwardedFor = req?.headers?.['x-forwarded-for']

    const ipAddress =
      req?.ip ??
      (Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor) ??
      null

    await AuditLog.create({
      user_id: userId || req?.user?.userId || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: req?.headers?.['user-agent'] ?? null,
    })
  } catch (error: unknown) {
    // Audit log tidak boleh membuat request utama gagal.
    console.error('Create audit log error:', error)
  }
}

module.exports = {
  createAuditLog,
}