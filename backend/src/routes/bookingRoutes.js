// bookingRoutes.js
// Defines all booking related API endpoints
// All routes are protected — login required

const express = require('express');
const router = express.Router();
const {
  createBooking,
  getCustomerBookings,
  getWorkerBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, workerOnly } = require('../middleware/authMiddleware');

// POST /api/bookings → create new booking (customer only)
router.post('/', protect, createBooking);

// GET /api/bookings/customer → get customer bookings
router.get('/customer', protect, getCustomerBookings);

// GET /api/bookings/worker → get worker bookings
router.get('/worker', protect, workerOnly, getWorkerBookings);

// PUT /api/bookings/:id → update booking status
router.put('/:id', protect, updateBookingStatus);

module.exports = router;