const {
  User,
  Shop,
  Product,
  Workshop,
  Transaction,
  Review,
} = require('../models')

async function getDashboard(req, res) {
  try {
    const [
      totalUsers,
      totalShops,
      totalProducts,
      totalWorkshops,
      totalTransactions,
      totalReviews,
      pendingTransactions,
      activeProducts,
      upcomingWorkshops,
    ] = await Promise.all([
      User.count(),

      Shop.count({
        where: {
          is_active: true,
        },
      }),

      Product.count({
        where: {
          status: 'active',
        },
      }),

      Workshop.count({
        where: {
          status: 'upcoming',
        },
      }),

      Transaction.count(),

      Review.count({
        where: {
          is_active: true,
        },
      }),

      Transaction.count({
        where: {
          status: 'pending',
        },
      }),

      Product.count({
        where: {
          status: 'active',
        },
      }),

      Workshop.count({
        where: {
          status: 'upcoming',
        },
      }),
    ])

    return res.json({
      success: true,
      data: {
        statistics: {
          total_users: totalUsers,
          total_shops: totalShops,
          total_products: totalProducts,
          total_workshops: totalWorkshops,
          total_transactions: totalTransactions,
          total_reviews: totalReviews,
          pending_transactions: pendingTransactions,
          active_products: activeProducts,
          upcoming_workshops: upcomingWorkshops,
        },
      },
    })
  } catch (error) {
    console.error('Get dashboard error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard.',
    })
  }
}

module.exports = {
  getDashboard,
}