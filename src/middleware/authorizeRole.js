function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan.',
      })
    }

    const userRole = req.user.role

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
      })
    }

    next()
  }
}

module.exports = authorizeRole