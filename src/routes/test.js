/**
 * Test routes for checking EJS rendering
 */
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * @route   GET /test/view
 * @desc    Test route to check if EJS is rendering properly
 * @access  Public
 */
router.get('/view', (req, res) => {
  logger.info('Rendering test view');
  
  res.render('test', { 
    title: 'EJS Test Page',
    message: 'If you can see this, EJS rendering is working correctly.',
    user: null,
    layout: 'layouts/main'
  });
});

/**
 * @route   GET /test/data
 * @desc    Test route to return JSON data
 * @access  Public
 */
router.get('/data', (req, res) => {
  logger.info('Sending test data');
  
  res.json({ 
    status: 'success',
    message: 'API is working',
    timestamp: new Date()
  });
});

module.exports = router;
