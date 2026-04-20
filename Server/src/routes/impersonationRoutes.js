const express = require('express');
const router = express.Router();
const { 
  startImpersonation, 
  endImpersonation, 
  getImpersonationLogs, 
  getCurrentImpersonation 
} = require('../controllers/impersonationController');

// Import middleware
const authenticateToken = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// @route   POST /api/admin/impersonate
// @desc    Start impersonating a user
// @access   Admin only
router.post('/impersonate', startImpersonation);

// @route   POST /api/admin/end-impersonation
// @desc    End current impersonation session
// @access   During impersonation only
router.post('/end-impersonation', endImpersonation);

// @route   GET /api/admin/impersonation-logs
// @desc    Get impersonation logs
// @access   Admin only
router.get('/impersonation-logs', getImpersonationLogs);

// @route   GET /api/admin/current-impersonation
// @desc    Get current active impersonation
// @access   During impersonation only
router.get('/current-impersonation', getCurrentImpersonation);

module.exports = router;
