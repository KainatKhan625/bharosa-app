// reviewRoutes.js
// Defines all review related API endpoints

const express = require('express');
const router = express.Router();
const { addReview, getWorkerReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/reviews → add review (login required)
router.post('/', protect, addReview);

// GET /api/reviews/:worker_id → get worker reviews (public)
router.get('/:worker_id', getWorkerReviews);

module.exports = router;