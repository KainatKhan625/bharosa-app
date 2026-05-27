// adminRoutes.js
// All admin routes — only admin can access
// protect + adminOnly middleware on every route

const express = require('express');
const router = express.Router();
const {
  getPendingWorkers,
  updateWorkerVerification,
  getAllUsers,
  getStats,
  deleteUser
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes protected — admin only
// GET /api/admin/workers/pending → pending workers list
router.get('/workers/pending', protect, adminOnly, getPendingWorkers);

// PUT /api/admin/workers/:id/verify → verify or reject worker
router.put('/workers/:id/verify', protect, adminOnly, updateWorkerVerification);

// GET /api/admin/users → all users list
router.get('/users', protect, adminOnly, getAllUsers);

// GET /api/admin/stats → app statistics
router.get('/stats', protect, adminOnly, getStats);

// DELETE /api/admin/users/:id → delete user
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;