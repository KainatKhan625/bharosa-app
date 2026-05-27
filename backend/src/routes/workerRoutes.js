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

module.exports = router;