const express = require('express');
const router = express.Router();
const {
  register,
  login,
  signUpWithOTP,
  verifyOTP,
  resetPassword,
  verifyResetPasswordOTP,
  updatePasswordForReset,
  googleLogin
} = require('../controllers/authController');

// Google Authentication
router.post('/google', googleLogin);

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Sign up with OTP
router.post('/signup-otp', signUpWithOTP);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Reset Password - Send OTP
router.post('/reset-password', resetPassword);

// Verify Reset Password OTP
router.post('/verify-reset-otp', verifyResetPasswordOTP);

// Update Password (for reset flow)
router.post('/update-password-reset', updatePasswordForReset);

module.exports = router;
