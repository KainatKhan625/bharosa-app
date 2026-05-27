// reviewModel.js
// Creates reviews table in database
// Stores customer reviews and ratings for workers after job completion

const pool = require('../db');

const createReviewsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
      customer_id INT REFERENCES users(id) ON DELETE CASCADE,
      worker_id INT REFERENCES workers(id) ON DELETE CASCADE,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(query);
    console.log('Reviews table ready!');
  } catch (err) {
    console.error('Reviews table failed:', err);
  }
};

createReviewsTable();

module.exports = pool;