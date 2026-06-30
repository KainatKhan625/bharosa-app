// authController.js
// Handles user registration, login, and password reset
// Input validation + security + OTP system added

const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate Pakistani phone number
const isValidPhone = (phone) => {
  return /^03[0-9]{9}$/.test(phone);
};

// Email transporter setup — uses Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// REGISTER
const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, city, service_type, cnic } = req.body;

    if (!full_name || !email || !phone || !password || !role || !city) {
      return res.status(400).json({ message: 'Please fill all required fields!' });
    }
    if (full_name.trim().length < 3) {
      return res.status(400).json({ message: 'Name must be at least 3 characters!' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format!' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone! Use format: 03XXXXXXXXX' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters!' });
    }
    if (!['customer', 'worker'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role!' });
    }
    if (role === 'worker') {
      if (!cnic) return res.status(400).json({ message: 'CNIC is required for workers!' });
      if (!service_type) return res.status(400).json({ message: 'Service type is required for workers!' });
    }

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await pool.query(
      `INSERT INTO users 
        (full_name, email, phone, password, role, city, service_type, cnic) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, full_name, email, role`,
      [
        full_name.trim(), email.toLowerCase().trim(), phone.trim(),
        hashedPassword, role, city, service_type || null, cnic || null
      ]
    );

    const userId = newUser.rows[0].id;

    if (role === 'worker') {
      await pool.query(
        `INSERT INTO workers (user_id, service_type, cnic, city, is_verified, is_available)
         VALUES ($1, $2, $3, $4, FALSE, TRUE)`,
        [userId, service_type, cnic, city]
      );
    }

    const token = jwt.sign(
      { id: userId, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error!' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required!' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format!' });
    }

    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.rows[0].id,
        full_name: user.rows[0].full_name,
        email: user.rows[0].email,
        role: user.rows[0].role
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error!' });
  }
};

// SEND OTP — generates 6-digit OTP and emails it
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email required!' });
    }

    // Check if user exists
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'No account found with this email!' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database
    await pool.query(
      'INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)',
      [email.toLowerCase().trim(), otp, expiresAt]
    );

    // Send email with OTP
    await transporter.sendMail({
      from: `"Bharosa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bharosa — Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563EB;">Bharosa Password Reset</h2>
          <p>Your OTP code is:</p>
          <h1 style="background: #EFF6FF; color: #2563EB; padding: 16px; text-align: center; border-radius: 8px; letter-spacing: 4px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #999;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'OTP sent to your email!' });

  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ message: 'Could not send OTP! Please try again.' });
  }
};

// VERIFY OTP AND RESET PASSWORD
const verifyOtpAndReset = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({ message: 'All fields required!' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters!' });
    }

    // Find valid OTP — not used, not expired
    const otpRecord = await pool.query(
      `SELECT * FROM otps 
       WHERE email = $1 AND otp_code = $2 AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase().trim(), otp]
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP!' });
    }

    // Mark OTP as used
    await pool.query(
      'UPDATE otps SET is_used = TRUE WHERE id = $1',
      [otpRecord.rows[0].id]
    );

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 12);

    // Update user password
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email.toLowerCase().trim()]
    );

    res.status(200).json({ message: 'Password reset successfully!' });

  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { register, login, sendOtp, verifyOtpAndReset };