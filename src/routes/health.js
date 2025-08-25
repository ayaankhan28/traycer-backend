const express = require('express');
const router = express.Router();
const healthService = require('../services/healthService');

// GET /api/health
router.get('/', async (req, res) => {
  try {
    const healthStatus = await healthService.getHealthStatus();
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router;
