const express = require('express')

const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController')

const authenticateToken = require('../middleware/auth')

const router = express.Router()

// Public
router.get('/reviews', getReviews)
router.get('/reviews/:id', getReviewById)

// User yang login boleh membuat review
router.post(
  '/reviews',
  authenticateToken,
  createReview,
)

// User boleh mengubah review miliknya.
// Admin juga boleh mengubah review apa pun.
router.put(
  '/reviews/:id',
  authenticateToken,
  updateReview,
)

// User boleh menghapus review miliknya.
// Admin juga boleh menghapus review apa pun.
router.delete(
  '/reviews/:id',
  authenticateToken,
  deleteReview,
)

module.exports = router