// bookingModel.js
// Creates bookings table in database
// Stores all service booking information between customer and worker

const pool = require('../db');

const createBookingsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INT REFERENCES users(id) ON DELETE CASCADE,
      worker_id INT REFERENCES workers(id) ON DELETE CASCADE,
      service_type VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
      address TEXT NOT NULL,
      city VARCHAR(50) NOT NULL,
      scheduled_date DATE NOT NULL,
      scheduled_time TIME NOT NULL,
      problem_description TEXT,
      estimated_price DECIMAL(10,2),
      final_price DECIMAL(10,2),
      payment_status VARCHAR(20) DEFAULT 'unpaid'
        CHECK (payment_status IN ('unpaid', 'paid')),
      customer_note TEXT,
      worker_note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(query);
    console.log('Bookings table ready!');
  } catch (err) {
    console.error('Bookings table failed:', err);
  }
};

createBookingsTable();

module.exports = pool;