const { Review, User, Product } = require('../models')

async function getReviews(req, res) {
  try {
    const reviews = await Review.findAll({
      where: {
        is_active: true,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'image'],
        },
      ],
      order: [['id', 'DESC']],
    })

    return res.json({
      success: true,
      data: reviews,
    })
  } catch (error) {
    console.error('Get reviews error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data ulasan.',
    })
  }
}

async function getReviewById(req, res) {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'image'],
        },
      ],
    })

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Ulasan tidak ditemukan.',
      })
    }

    return res.json({
      success: true,
      data: review,
    })
  } catch (error) {
    console.error('Get review detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail ulasan.',
    })
  }
}

async function createReview(req, res) {
  try {
    const {
      product_id,
      rating,
      comment,
    } = req.body

    if (!product_id || rating === undefined) {
      return res.status(422).json({
        success: false,
        message: 'product_id dan rating wajib diisi.',
      })
    }

    const numericRating = Number(rating)

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(422).json({
        success: false,
        message: 'Rating harus berupa angka 1 sampai 5.',
      })
    }

    const userId = req.user.userId

    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(422).json({
        success: false,
        message: 'User tidak ditemukan.',
      })
    }

    const product = await Product.findByPk(product_id)

    if (!product) {
      return res.status(422).json({
        success: false,
        message: 'Produk tidak ditemukan.',
      })
    }

    const review = await Review.create({
      user_id: userId,
      product_id,
      rating: numericRating,
      comment: comment || null,
      is_active: true,
    })

    const createdReview = await Review.findByPk(
      review.id,
      {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
          {
            model: Product,
            as: 'product',
            attributes: [
              'id',
              'name',
              'slug',
              'image',
            ],
          },
        ],
      },
    )

    return res.status(201).json({
      success: true,
      message: 'Ulasan berhasil dibuat.',
      data: createdReview,
    })
  } catch (error) {
    console.error('Create review error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal membuat ulasan.',
    })
  }
}

async function updateReview(req, res) {
  try {
    const review = await Review.findByPk(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Ulasan tidak ditemukan.',
      })
    }

    const isAdmin = req.user.role === 'admin'
    const isOwner = review.user_id === req.user.userId

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk mengubah ulasan ini.',
      })
    }

    const {
      rating,
      comment,
      is_active,
    } = req.body

    if (rating !== undefined) {
      const numericRating = Number(rating)

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(422).json({
          success: false,
          message: 'Rating harus berupa angka 1 sampai 5.',
        })
      }

      review.rating = numericRating
    }

    if (comment !== undefined) {
      review.comment = comment
    }

    // Hanya admin yang boleh mengubah status aktif/nonaktif.
    if (
      is_active !== undefined &&
      isAdmin
    ) {
      review.is_active = is_active
    }

    await review.save()

    return res.json({
      success: true,
      message: 'Ulasan berhasil diperbarui.',
      data: review,
    })
  } catch (error) {
    console.error('Update review error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui ulasan.',
    })
  }
}

async function deleteReview(req, res) {
  try {
    const review = await Review.findByPk(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Ulasan tidak ditemukan.',
      })
    }

    const isAdmin = req.user.role === 'admin'
    const isOwner = review.user_id === req.user.userId

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk menghapus ulasan ini.',
      })
    }

    await review.destroy()

    return res.json({
      success: true,
      message: 'Ulasan berhasil dihapus.',
    })
  } catch (error) {
    console.error('Delete review error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus ulasan.',
    })
  }
}

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
}