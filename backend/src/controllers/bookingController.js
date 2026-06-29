// bookingController.js
// Handles all booking operations
// Input validation + security added

const pool = require('../db');

// CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    const {
      worker_id,
      service_type,
      address,
      city,
      scheduled_date,
      scheduled_time,
      problem_description,
      estimated_price
    } = req.body;

    const customer_id = req.user.id;

    // ============ INPUT VALIDATION ============

    if (!worker_id || !address || !scheduled_date || !scheduled_time || !city) {
      return res.status(400).json({ message: 'Please fill all required fields!' });
    }

    // Address min length
    if (address.trim().length < 10) {
      return res.status(400).json({ message: 'Please enter complete address!' });
    }

    // Date validation — must be future date
    const bookingDate = new Date(scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format!' });
    }

    if (bookingDate < today) {
      return res.status(400).json({ message: 'Booking date must be in the future!' });
    }

    // Time validation
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(scheduled_time)) {
      return res.status(400).json({ message: 'Invalid time format!' });
    }

    // ============ DATABASE OPERATIONS ============

    // Check worker exists and is available
    const worker = await pool.query(
      'SELECT * FROM workers WHERE id = $1 AND is_available = TRUE AND is_verified = TRUE',
      [worker_id]
    );

    if (worker.rows.length === 0) {
      return res.status(404).json({ message: 'Worker not available!' });
    }

    // Check customer not booking own worker profile
    if (worker.rows[0].user_id === customer_id) {
      return res.status(400).json({ message: 'You cannot book yourself!' });
    }

    // Create booking
    const booking = await pool.query(`
      INSERT INTO bookings 
        (customer_id, worker_id, service_type, address, city, 
         scheduled_date, scheduled_time, problem_description, estimated_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      customer_id,
      worker_id,
      service_type,
      address.trim(),
      city,
      scheduled_date,
      scheduled_time,
      problem_description?.trim() || null,
      estimated_price
    ]);

    res.status(201).json({
      message: 'Booking created successfully!',
      booking: booking.rows[0]
    });

  } catch (err) {
    console.error('Create booking error:', err.message);
    res.status(500).json({ message: 'Server error!' });
  }
};

// GET CUSTOMER BOOKINGS
const getCustomerBookings = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const bookings = await pool.query(`
      SELECT 
        b.*,
        u.full_name as worker_name,
        u.phone as worker_phone,
        w.avg_rating as worker_rating,
        w.profile_image as worker_image
      FROM bookings b
      JOIN workers w ON b.worker_id = w.id
      JOIN users u ON w.user_id = u.id
      WHERE b.customer_id = $1
      ORDER BY b.created_at DESC
    `, [customer_id]);

    res.status(200).json({ bookings: bookings.rows });

  } catch (err) {
    console.error('Get customer bookings error:', err.message);
    res.status(500).json({ message: 'Server error!' });
  }
};

// GET WORKER BOOKINGS
const getWorkerBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get worker id from user id
    const workerResult = await pool.query(
      'SELECT id FROM workers WHERE user_id = $1',
      [userId]
    );

    if (workerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Worker profile not found!' });
    }

    const worker_id = workerResult.rows[0].id;

    const bookings = await pool.query(`
      SELECT 
        b.*,
        u.full_name as customer_name,
        u.phone as customer_phone
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      WHERE b.worker_id = $1
      ORDER BY b.created_at DESC
    `, [worker_id]);

    res.status(200).json({ bookings: bookings.rows });

  } catch (err) {
    console.error('Get worker bookings error:', err.message);
    res.status(500).json({ message: 'Server error!' });
  }
};

// UPDATE BOOKING STATUS
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, worker_note, final_price } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate status
    const allowedStatuses = ['accepted', 'rejected', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status!' });
    }

    // Customer can only cancel
    if (userRole === 'customer' && status !== 'cancelled') {
      return res.status(403).json({ message: 'Customer can only cancel booking!' });
    }

    // Worker can only accept/reject/complete
    if (userRole === 'worker' && status === 'cancelled') {
      return res.status(403).json({ message: 'Worker cannot cancel booking!' });
    }

    // Check booking exists
    const existingBooking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (existingBooking.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found!' });
    }

    // Update booking
    const booking = await pool.query(`
      UPDATE bookings 
      SET 
        status = $1,
        worker_note = COALESCE($2, worker_note),
        final_price = COALESCE($3, final_price),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, worker_note || null, final_price || null, id]);

    // If completed — update worker total jobs
    if (status === 'completed') {
      await pool.query(
        'UPDATE workers SET total_jobs = total_jobs + 1 WHERE id = $1',
        [booking.rows[0].worker_id]
      );
    }

    res.status(200).json({
      message: `Booking ${status} successfully!`,
      booking: booking.rows[0]
    });

  } catch (err) {
    console.error('Update booking error:', err.message);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { createBooking, getCustomerBookings, getWorkerBookings, updateBookingStatus };