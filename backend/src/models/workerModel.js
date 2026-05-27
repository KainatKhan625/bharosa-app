// workerModel.js
// Creates workers table in database
// Stores worker profile, verification status, and ratings

const pool = require('../db');

const createWorkersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS workers (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      service_type VARCHAR(50) NOT NULL,
      cnic VARCHAR(20) UNIQUE NOT NULL,
      experience_years INT DEFAULT 0,
      hourly_rate DECIMAL(10,2) DEFAULT 0,
      bio TEXT,
      city VARCHAR(50),
      area VARCHAR(100),
      is_verified BOOLEAN DEFAULT FALSE,
      is_available BOOLEAN DEFAULT TRUE,
      avg_rating DECIMAL(3,2) DEFAULT 0,
      total_reviews INT DEFAULT 0,
      total_jobs INT DEFAULT 0,
      profile_image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(query);
    console.log('Workers table ready!');
  } catch (err) {
    console.error('Workers table failed:', err);
  }
};

createWorkersTable();

module.exports = pool;