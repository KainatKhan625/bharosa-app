// server.js
// Main entry point of the application — everything starts here
// Security middleware added — rate limiting, helmet, input validation

const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Secure HTTP headers
const rateLimit = require('express-rate-limit'); // Rate limiting

require('dotenv').config();

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet — secure HTTP headers
// Protects against common attacks like XSS, clickjacking etc
app.use(helmet());

// CORS — only allow our frontend
// Prevents unauthorized domains from accessing our API
app.use(cors({
  origin: [
    'http://localhost:8081',  // Expo web
    'http://localhost:19006', // Expo web alternate
    'exp://192.168.1.18:8081', // Expo Go mobile
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON — limit 10mb max
app.use(express.json({ limit: '10mb' }));

// General rate limit — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests
  message: { message: 'Too many requests! Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Auth rate limit — stricter — 10 requests per 15 minutes
// Prevents brute force login attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts! Please try again later.' },
});

// ============================================
// DATABASE & TABLES
// ============================================
require('./db');
require('./models/userModel');
require('./models/workerModel');
require('./models/bookingModel');
require('./models/reviewModel');

// ============================================
// ROUTES
// ============================================
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Apply auth limiter only on auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Bharosa Backend Running!' });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
// Catches any unhandled errors — prevents server crash
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler — route not found
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found!' });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});