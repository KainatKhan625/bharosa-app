// authController.js
// Handles user registration and login
// Input validation + security added

const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate Pakistani phone number
const isValidPhone = (phone) => {
  return /^03[0-9]{9}$/.test(phone);
};

// REGISTER
const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, city, service_type, cnic } = req.body;

    // ============ INPUT VALIDATION ============

    // Check required fields
    if (!full_name || !email || !phone || !password || !role || !city) {
      return res.status(400).json({ message: 'Please fill all required fields!' });
    }

    // Name validation — min 3 chars
    if (full_name.trim().length < 3) {
      return res.status(400).json({ message: 'Name must be at least 3 characters!' });
    }

    // Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format!' });
    }

    // Phone validation — Pakistani format
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone! Use format: 03XXXXXXXXX' });
    }

    // Password strength — min 6 chars
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters!' });
    }

    // Role validation — only customer or worker allowed
    if (!['customer', 'worker'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role!' });
    }

    // Worker specific validation
    if (role === 'worker') {
      if (!cnic) {
        return res.status(400).json({ message: 'CNIC is required for workers!' });
      }
      if (!service_type) {
        return res.status(400).json({ message: 'Service type is required for workers!' });
      }
    }

    // ============ DATABASE OPERATIONS ============

    // Check if email already exists — lowercase compare
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // Encrypt password — 12 rounds more secure than 10
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save user to users table
    const newUser = await pool.query(
      `INSERT INTO users 
        (full_name, email, phone, password, role, city, service_type, cnic) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, full_name, email, role`,
      [
        full_name.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        hashedPassword,
        role,
        city,
        service_type || null,
        cnic || null
      ]
    );

    const userId = newUser.rows[0].id;

    // If role is worker — automatically create worker profile
    if (role === 'worker') {
      await pool.query(
        `INSERT INTO workers 
          (user_id, service_type, cnic, city, is_verified, is_available)
         VALUES ($1, $2, $3, $4, FALSE, TRUE)`,
        [userId, service_type, cnic, city]
      );
    }

    // Generate JWT token
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
    // Don't expose internal errors to client
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error!' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ============ INPUT VALIDATION ============
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required!' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format!' });
    }

    // ============ DATABASE OPERATIONS ============

    // Find user — lowercase email
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (user.rows.length === 0) {
      // Don't reveal if email exists — security best practice
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send response with role — frontend will navigate accordingly
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

module.exports = { register, login };