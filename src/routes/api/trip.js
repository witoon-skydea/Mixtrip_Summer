/**
 * API Routes for Trip
 */
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/authMiddleware');

// Temporary place holder route
// These routes will be implemented as part of MIXTP-304 (Phase 3)
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trip API endpoints will be implemented in Phase 3',
    data: []
  });
});

router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trip API endpoints will be implemented in Phase 3',
    data: null
  });
});

module.exports = router;
