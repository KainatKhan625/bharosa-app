// server.js
// Main entry point of the application — everything starts here

const express = require('express'); // Web server framework
const cors = require('cors'); // Allows frontend to communicate with backend

require('dotenv').config(); // Loads .env variables

const app = express(); // Create express app

// Middleware — must be before routes
app.use(cors()); // Allow all cross-origin requests
app.use(express.json()); // Parse incoming JSON data

// Initialize database and create tables
require('./db');
require('./models/userModel');
require('./models/workerModel');
require('./models/bookingModel');
require('./models/reviewModel');

// Import and register all routes
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Test route — open localhost:5000 in browser to verify
app.get('/', (req, res) => {
  res.json({ message: 'Bharosa Backend Running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});