// authMiddleware.js
// Protects routes that require authentication
// Verifies JWT token on every protected request

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Get token from request header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token! Please login first.' });
    }

    // Verify token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request — available in all next functions
    req.user = decoded;

    next(); // Move to next function
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token! Please login again.' });
  }
};

// Only admin can access these routes
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only!' });
  }
  next();
};

// Only worker can access these routes
const workerOnly = (req, res, next) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ message: 'Worker access only!' });
  }
  next();
};

module.exports = { protect, adminOnly, workerOnly };