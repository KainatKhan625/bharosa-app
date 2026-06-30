// authRoutes.js
// Defines which URL triggers which function

const express = require('express');
const router = express.Router();
const { register, login, sendOtp, verifyOtpAndReset } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/send-otp — sends OTP to email
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-otp — verifies OTP and resets password
router.post('/verify-otp', verifyOtpAndReset);

module.exports = router;