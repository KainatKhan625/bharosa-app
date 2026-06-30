// otpModel.js
// Creates OTP table — stores temporary OTPs for password reset
// OTP expires after 10 minutes

const pool = require('../db');

const createOtpTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS otps (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      otp_code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      is_used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(query);
    console.log('OTP table ready!');
  } catch (err) {
    console.error('OTP table failed:', err);
  }
};

createOtpTable();

module.exports = pool;