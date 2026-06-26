// authController.js
// Handles user registration and login
// Automatically creates worker profile when role is 'worker'

const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, city, service_type, cnic } = req.body;

    // 1. Check if email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // 2. Encrypt password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save user to users table
    const newUser = await pool.query(
      `INSERT INTO users 
        (full_name, email, phone, password, role, city, service_type, cnic) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, full_name, email, role`,
      [full_name, email, phone, hashedPassword, role, city, service_type, cnic]
    );

    const userId = newUser.rows[0].id;

    // 4. If role is worker — automatically create worker profile
    if (role === 'worker') {
      await pool.query(
        `INSERT INTO workers 
          (user_id, service_type, cnic, city, is_verified, is_available)
         VALUES ($1, $2, $3, $4, FALSE, TRUE)`,
        [userId, service_type, cnic, city]
      );
      // Note: is_verified = FALSE — admin will verify the worker
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      { id: userId, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Send response
    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Email not found!' });
    }

    // 2. Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password!' });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Send response with role — frontend will navigate accordingly
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
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { register, login };