const { User, ImpersonationLog } = require('../models');
const { generateToken } = require('../utils/auth');
const { Op } = require('sequelize');

// @desc    Start impersonating a user
// @route   POST /api/admin/impersonate
// @access  Admin only
const startImpersonation = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const adminId = req.user.id;

    // Validate input
    if (!userId || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and reason are required' 
      });
    }

    // Get target user
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get admin user
    const adminUser = await User.findByPk(adminId);
    if (!adminUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin user not found' 
      });
    }

    // Check if target user is admin (prevent admin-on-admin impersonation)
    if (targetUser.role === 'admin' || targetUser.adminRoleId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot impersonate admin users' 
      });
    }

    // Check if there's already an active impersonation for this admin
    const existingImpersonation = await ImpersonationLog.findOne({
      where: {
        adminId,
        isActive: true,
        endTime: null
      }
    });

    if (existingImpersonation) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active impersonation session' 
      });
    }

    // Create impersonation log
    const impersonationLog = await ImpersonationLog.create({
      adminId,
      userId,
      reason: reason.trim(),
      startTime: new Date(),
      isActive: true
    });

    // Generate impersonation token (1 hour expiry)
    const impersonationToken = generateToken(
      targetUser.id, 
      targetUser.email, 
      targetUser.name,
      '1h' // 1 hour expiration
    );

    // Create enhanced token payload for frontend
    const enhancedToken = {
      token: impersonationToken,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      },
      isImpersonating: true,
      originalAdminId: adminId,
      impersonationId: impersonationLog.id
    };

    res.status(200).json({
      success: true,
      data: enhancedToken,
      message: `Successfully impersonating ${targetUser.name}`
    });

  } catch (error) {
    console.error('Error starting impersonation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start impersonation' 
    });
  }
};

// @desc    End current impersonation session
// @route   POST /api/admin/end-impersonation
// @access  During impersonation only
const endImpersonation = async (req, res) => {
  try {
    const { impersonationId } = req.body;

    if (!impersonationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Impersonation ID is required' 
      });
    }

    // Find and update impersonation log
    const impersonationLog = await ImpersonationLog.findByPk(impersonationId);
    if (!impersonationLog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Impersonation session not found' 
      });
    }

    // Update impersonation log
    await impersonationLog.update({
      endTime: new Date(),
      isActive: false
    });

    res.status(200).json({
      success: true,
      message: 'Impersonation session ended successfully'
    });

  } catch (error) {
    console.error('Error ending impersonation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to end impersonation' 
    });
  }
};

// @desc    Get impersonation logs
// @route   GET /api/admin/impersonation-logs
// @access  Admin only
const getImpersonationLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const logs = await ImpersonationLog.findAndCountAll({
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        logs: logs.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(logs.count / limit),
          totalLogs: logs.count
        }
      }
    });

  } catch (error) {
    console.error('Error fetching impersonation logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch impersonation logs' 
    });
  }
};

// @desc    Get current active impersonation
// @route   GET /api/admin/current-impersonation
// @access  During impersonation only
const getCurrentImpersonation = async (req, res) => {
  try {
    const { impersonationId } = req.query;

    if (!impersonationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Impersonation ID is required' 
      });
    }

    const impersonationLog = await ImpersonationLog.findByPk(impersonationId, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!impersonationLog || !impersonationLog.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Active impersonation session not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: impersonationLog
    });

  } catch (error) {
    console.error('Error fetching current impersonation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch impersonation info' 
    });
  }
};

module.exports = {
  startImpersonation,
  endImpersonation,
  getImpersonationLogs,
  getCurrentImpersonation
};
