const { AuditLog } = require('../models')

async function createAuditLog({
  req,
  userId = null,
  action,
  entityType = null,
  entityId = null,
  oldValues = null,
  newValues = null,
}) {
  try {
    await AuditLog.create({
      user_id: userId || req?.user?.userId || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address:
        req?.ip ||
        req?.headers?.['x-forwarded-for'] ||
        null,
      user_agent:
        req?.headers?.['user-agent'] ||
        null,
    })
  } catch (error) {
    // Audit log tidak boleh membuat request utama gagal.
    console.error('Create audit log error:', error)
  }
}

module.exports = {
  createAuditLog,
}
