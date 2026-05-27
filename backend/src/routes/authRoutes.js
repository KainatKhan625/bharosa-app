// authRoutes.js
// Defines which URL triggers which function
// Example: POST /api/auth/register → calls register function

const express = require('express');
const router = express.Router(); // Mini router — handles only auth routes
const { register, login } = require('../controllers/authController'); // Import functions from controller

// POST /api/auth/register
// Called when user submits the register form
router.post('/register', register);

// POST /api/auth/login
// Called when user submits the login form
router.post('/login', login);

module.exports = router; // Export for use in server.js