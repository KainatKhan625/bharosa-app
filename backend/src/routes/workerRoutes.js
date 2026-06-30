// workerRoutes.js
// Defines all worker related API endpoints

const express = require('express');
const router = express.Router();
const { getWorkers, getWorkerById, updateWorkerProfile } = require('../controllers/workerController');
const { protect, workerOnly } = require('../middleware/authMiddleware');

// Public routes — no login required
// GET /api/workers → get all workers with filters
router.get('/', getWorkers);

// GET /api/workers/:id → get single worker profile
router.get('/:id', getWorkerById);

// Protected routes — login required
// PUT /api/workers/profile → worker updates own profile
router.put('/profile', protect, workerOnly, updateWorkerProfile);

// GET /api/workers/profile/me → get own worker profile
router.get('/profile/me', protect, workerOnly, async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(
      'SELECT * FROM workers WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Worker profile not found!' });
    }
    res.status(200).json({ worker: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;