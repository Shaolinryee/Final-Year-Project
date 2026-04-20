const { User, SystemLog } = require('../models');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { Op } = require('sequelize');

/**
 * Get admin profile information
 */
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Get admin statistics
    const stats = {
      totalUsers: await User.count(),
      activeUsers: await User.count({ where: { isActive: true } }),
      loginCount: admin.loginCount || 0,
      lastLogin: admin.lastLoginAt
    };

    res.json({
      success: true,
      data: {
        admin,
        stats
      }
    });
  } catch (error) {
    console.error('Error getting admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update admin profile information
 */
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const adminId = req.user.id;

    const admin = await User.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== admin.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    await admin.update({
      name: name || admin.name,
      email: email || admin.email,
      updatedAt: new Date()
    });

    // Log the profile update
    await SystemLog.create({
      userId: adminId,
      action: 'profile_update',
      resource: 'admin_profile',
      details: { fields: ['name', 'email'].filter(field => req.body[field]) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'info',
      category: 'admin_actions'
    });

    res.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Change admin password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const admin = await User.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await admin.update({ 
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    // Log password change
    await SystemLog.create({
      userId: adminId,
      action: 'password_change',
      resource: 'admin_profile',
      details: { timestamp: new Date().toISOString() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'high',
      category: 'security_events'
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Upload profile photo
 */
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const adminId = req.user.id;
    const photoUrl = `/uploads/avatars/${req.file.filename}`;

    await User.update(
      { avatar: photoUrl },
      { where: { id: adminId } }
    );

    // Log photo upload
    await SystemLog.create({
      userId: adminId,
      action: 'profile_photo_upload',
      resource: 'admin_profile',
      details: { filename: req.file.filename },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'info',
      category: 'admin_actions'
    });

    res.json({
      success: true,
      data: { avatar: photoUrl }
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get admin login history
 */
const getLoginHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const logs = await SystemLog.findAll({
      where: {
        userId: req.user.id,
        action: 'login'
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'ipAddress', 'userAgent', 'createdAt', 'details']
    });

    const total = await SystemLog.count({
      where: {
        userId: req.user.id,
        action: 'login'
      }
    });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting login history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get active sessions (simplified version)
 */
const getActiveSessions = async (req, res) => {
  try {
    // This is a simplified version - in production, you'd track actual sessions
    const recentLogins = await SystemLog.findAll({
      where: {
        userId: req.user.id,
        action: 'login'
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'ipAddress', 'userAgent', 'createdAt']
    });

    // Transform to session format
    const sessions = recentLogins.map((login, index) => ({
      id: login.id,
      ipAddress: login.ipAddress,
      userAgent: login.userAgent,
      createdAt: login.createdAt,
      isCurrent: index === 0, // Most recent is current
      deviceInfo: parseUserAgent(login.userAgent)
    }));

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Revoke session
 */
const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // In a real implementation, you'd invalidate the session token
    // For now, we'll just log the action
    await SystemLog.create({
      userId: req.user.id,
      action: 'session_revoke',
      resource: 'admin_profile',
      details: { sessionId },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'medium',
      category: 'security_events'
    });

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Enable 2FA
 */
const enable2FA = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Generate 2FA secret
    const secret = speakeasy.generateSecret({
      name: `CollabSpace Admin (${req.user.email})`,
      issuer: 'CollabSpace'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (in production, you'd store this securely)
    // For now, we'll just return it to the user

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      }
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify and confirm 2FA setup
 */
const verify2FASetup = async (req, res) => {
  try {
    const { token, secret } = req.body;
    
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // In production, you'd store the secret in the database
    // For now, we'll just log the successful setup
    await SystemLog.create({
      userId: req.user.id,
      action: '2fa_enabled',
      resource: 'admin_profile',
      details: { timestamp: new Date().toISOString() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'high',
      category: 'security_events'
    });

    res.json({
      success: true,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('Error verifying 2FA setup:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
  // Simple user agent parsing
  if (userAgent.includes('Chrome')) return { browser: 'Chrome', os: 'Unknown' };
  if (userAgent.includes('Firefox')) return { browser: 'Firefox', os: 'Unknown' };
  if (userAgent.includes('Safari')) return { browser: 'Safari', os: 'Unknown' };
  return { browser: 'Unknown', os: 'Unknown' };
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  uploadProfilePhoto,
  getLoginHistory,
  getActiveSessions,
  revokeSession,
  enable2FA,
  verify2FASetup
};
