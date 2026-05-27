// reviewController.js
// Handles all review operations
// Customer can add review after job completion
// Get worker reviews

const pool = require('../db');

// Add review after booking completion
// Only customer can add review, only once per booking
const addReview = async (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body;
    const customer_id = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5!' });
    }

    // Check if booking exists and is completed
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND customer_id = $2 AND status = $3',
      [booking_id, customer_id, 'completed']
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: 'Completed booking not found!' });
    }

    // Check if review already exists for this booking
    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE booking_id = $1',
      [booking_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ message: 'Review already submitted!' });
    }

    // Add review
    const review = await pool.query(`
      INSERT INTO reviews (booking_id, customer_id, worker_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [booking_id, customer_id, booking.rows[0].worker_id, rating, comment]);

    // Update worker average rating
    await pool.query(`
      UPDATE workers 
      SET 
        avg_rating = (
          SELECT ROUND(AVG(rating)::numeric, 2) 
          FROM reviews 
          WHERE worker_id = $1
        ),
        total_reviews = total_reviews + 1
      WHERE id = $1
    `, [booking.rows[0].worker_id]);

    res.status(201).json({
      message: 'Review added successfully!',
      review: review.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Get all reviews for a worker
const getWorkerReviews = async (req, res) => {
  try {
    const { worker_id } = req.params;

    const reviews = await pool.query(`
      SELECT 
        r.rating,
        r.comment,
        r.created_at,
        u.full_name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.worker_id = $1
      ORDER BY r.created_at DESC
    `, [worker_id]);

    res.status(200).json({
      reviews: reviews.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { addReview, getWorkerReviews };