const { User, SystemLog } = require('../models');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { sendOTPEmail } = require('../utils/email');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user (traditional)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true // By default verified for now, or use OTP flow
    });

    const token = generateToken(user.id, user.email, user.name);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login and login count
    await user.update({
      lastLoginAt: new Date(),
      loginCount: user.loginCount + 1
    });

    // Create login log entry
    await SystemLog.create({
      userId: user.id,
      action: 'login',
      resource: 'authentication',
      details: { 
        loginMethod: 'password',
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'info',
      category: 'authentication'
    });

    // Generate tokens
    const token = generateToken(user.id, user.email, user.name);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sign up with OTP (passwordless or verification step)
// @route   POST /api/auth/signup-otp
// @access  Public
const signUpWithOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ where: { email } });

    if (user) {
      user.verificationToken = otp;
      user.resetPasswordExpires = otpExpiry;
      await user.save();
    } else {
      // Create a temporary user if it doesn't exist
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: crypto.randomBytes(16).toString('hex'), // Random password for OTP users
        verificationToken: otp,
        resetPasswordExpires: otpExpiry,
        isVerified: false
      });
    }

    // Send email
    await sendOTPEmail(email, { otp });

    res.status(200).json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ success: false, message: 'Email and token are required' });
    }

    const user = await User.findOne({
      where: {
        email,
        verificationToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.verificationToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Update login info
    await user.update({
      lastLoginAt: new Date(),
      loginCount: user.loginCount + 1
    });

    // Create login log entry
    await SystemLog.create({
      userId: user.id,
      action: 'login',
      resource: 'authentication',
      details: { 
        loginMethod: 'otp',
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'info',
      category: 'authentication'
    });

    const authToken = generateToken(user.id, user.email, user.name);

    res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password - Send OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    const otp = generateOTP();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await sendOTPEmail(email, { otp, type: 'password_reset' });

    res.status(200).json({ success: true, message: 'Password reset code sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Reset Password OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetPasswordOTP = async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await User.findOne({
      where: {
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Usually we don't return an authToken here, but we can to allow immediate login
    // Or just return user info and let them set new password first
    const authToken = generateToken(user.id, user.email, user.name);

    res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Password (for reset flow)
// @route   PUT /api/auth/update-password-reset
// @access  Private (but often called after verify reset otp)
const updatePasswordForReset = async (req, res) => {
  try {
    const { password, email } = req.body; // or get user from token if middleware is used

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Google Login / Registration
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    let payload;

    if (credential) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else if (accessToken) {
      // If we got an access token from the frontend custom button
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      payload = await response.json();
    } else {
      return res.status(400).json({ success: false, message: 'No Google credential or access token provided' });
    }

    const { sub: googleId, email, name, picture: avatar } = payload;

    // Check if user exists by googleId or email
    let user = await User.findOne({ 
      where: { 
        [Op.or]: [{ googleId }, { email }]
      } 
    });

    if (user) {
      // If user exists by email but doesn't have googleId linked, link it
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        isVerified: true,
        // No password for Google users
      });
    }

    // Update login info
    await user.update({
      lastLoginAt: new Date(),
      loginCount: user.loginCount + 1
    });

    // Create login log entry
    await SystemLog.create({
      userId: user.id,
      action: 'login',
      resource: 'authentication',
      details: { 
        loginMethod: 'google_oauth',
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'info',
      category: 'authentication'
    });

    const token = generateToken(user.id, user.email, user.name);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Google Authentication failed. Please check your credentials.' });
  }
};

module.exports = {
  register,
  login,
  signUpWithOTP,
  verifyOTP,
  resetPassword,
  verifyResetPasswordOTP,
  updatePasswordForReset,
  googleLogin
};
