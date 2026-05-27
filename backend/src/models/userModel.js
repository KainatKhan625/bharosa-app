const pool = require('../db');

// Users table banana
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'worker', 'admin')),
      city VARCHAR(50),
      service_type VARCHAR(50),
      cnic VARCHAR(20),
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('Users table ready!');
  } catch (err) {
    console.error('Table creation failed:', err);
  }
};

createUsersTable();

module.exports = pool;