// bookingController.js
// Handles all booking operations
// Create booking, update status, get bookings

const pool = require('../db');

// Create new booking
// Customer books a worker for a service
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

    // Customer ID comes from JWT token
    const customer_id = req.user.id;

    // Validate required fields
    if (!worker_id || !address || !scheduled_date || !scheduled_time) {
      return res.status(400).json({ message: 'Please fill all required fields!' });
    }

    // Check if worker exists and is available
    const worker = await pool.query(
      'SELECT * FROM workers WHERE id = $1 AND is_available = TRUE',
      [worker_id]
    );

    if (worker.rows.length === 0) {
      return res.status(404).json({ message: 'Worker not available!' });
    }

    // Create booking
    const booking = await pool.query(`
      INSERT INTO bookings 
        (customer_id, worker_id, service_type, address, city, 
         scheduled_date, scheduled_time, problem_description, estimated_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [customer_id, worker_id, service_type, address, city,
        scheduled_date, scheduled_time, problem_description, estimated_price]);

    res.status(201).json({
      message: 'Booking created successfully!',
      booking: booking.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Get all bookings for logged in customer
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

    res.status(200).json({
      bookings: bookings.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Get all bookings for logged in worker
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

    res.status(200).json({
      bookings: bookings.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Update booking status
// Worker can accept/reject, both can cancel
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

    // Worker can only accept/reject/complete
    // Customer can only cancel
    if (userRole === 'customer' && status !== 'cancelled') {
      return res.status(403).json({ message: 'Customer can only cancel booking!' });
    }

    const booking = await pool.query(`
      UPDATE bookings 
      SET 
        status = $1,
        worker_note = COALESCE($2, worker_note),
        final_price = COALESCE($3, final_price),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, worker_note, final_price, id]);

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
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { createBooking, getCustomerBookings, getWorkerBookings, updateBookingStatus };