const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
const register = async (req, res) => {
  // req = user ne jo data bheja (name, email, password etc)
  // res = hum user ko jo jawab denge
  
  try {
    const { full_name, email, phone, password, role, city, service_type, cnic } = req.body;

    // 1. Check karo email pehle se exist tou nahi karti
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Email already registered!' 
      });
    }

    // 2. Password encrypt karo
    // bcrypt password ko hash karta hai
    // "12345" → "$2b$10$xK9mN..." (koi samajh nahi sakta)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Database mein save karo
    const newUser = await pool.query(
      `INSERT INTO users 
        (full_name, email, phone, password, role, city, service_type, cnic) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, full_name, email, role`,
      [full_name, email, phone, hashedPassword, role, city, service_type, cnic]
    );

    // 4. JWT Token banao
    // Yeh token user ko milega — har request mein yeh bhejega
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // 7 din valid rahega
    );

    // 5. Response bhejo
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

    // 1. Email se user dhoondhо
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Email not found!' 
      });
    }

    // 2. Password check karo
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Wrong password!' 
      });
    }

    // 3. Token banao
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Role ke hisaab se response
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