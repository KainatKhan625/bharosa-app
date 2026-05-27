// adminController.js
// Handles all admin operations
// Verify workers, manage users, view statistics

const pool = require('../db');

// Get all pending workers — waiting for verification
const getPendingWorkers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        w.id,
        w.service_type,
        w.cnic,
        w.experience_years,
        w.hourly_rate,
        w.city,
        w.created_at,
        u.full_name,
        u.email,
        u.phone
      FROM workers w
      JOIN users u ON w.user_id = u.id
      WHERE w.is_verified = FALSE
      ORDER BY w.created_at DESC
    `);

    res.status(200).json({
      count: result.rows.length,
      workers: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Verify or reject a worker
const updateWorkerVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const result = await pool.query(`
      UPDATE workers 
      SET is_verified = $1
      WHERE id = $2
      RETURNING *
    `, [is_verified, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Worker not found!' });
    }

    res.status(200).json({
      message: is_verified ? 'Worker verified!' : 'Worker rejected!',
      worker: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, full_name, email, phone, 
        role, city, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      count: result.rows.length,
      users: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Get app statistics
const getStats = async (req, res) => {
  try {
    // Run all queries at same time — faster!
    const [users, workers, bookings, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM workers WHERE is_verified = TRUE"),
      pool.query("SELECT COUNT(*) FROM bookings"),
      pool.query("SELECT SUM(final_price) FROM bookings WHERE payment_status = 'paid'"),
    ]);

    res.status(200).json({
      stats: {
        total_users: users.rows[0].count,
        total_workers: workers.rows[0].count,
        total_bookings: bookings.rows[0].count,
        total_revenue: revenue.rows[0].sum || 0,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.status(200).json({ message: 'User deleted!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = {
  getPendingWorkers,
  updateWorkerVerification,
  getAllUsers,
  getStats,
  deleteUser
};