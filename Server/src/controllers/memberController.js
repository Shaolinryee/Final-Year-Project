const { ProjectMember, User, Project } = require('../models');
const { sendNotification } = require('../utils/notification');
const { getUserProjectRole } = require('../middleware/rbac');

// @desc    Get project members
// @route   GET /api/projects/:projectId/members
// @access  Private
const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const members = await ProjectMember.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }
      ]
    });

    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:projectId/members
// @access  Private
const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if caller has permission to add members (admin or owner)
    const userRole = await getUserProjectRole(req.user.id, projectId);
    if (!userRole || (userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'owner')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only project admins and owners can add members' 
      });
    }

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({ where: { projectId, userId } });
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    const member = await ProjectMember.create({
      projectId,
      userId,
      role: role || 'member'
    });

    // Notify user
    if (userId !== req.user.id) {
        await sendNotification({
            userId,
            type: 'project_added',
            title: 'Added to Project',
            message: `${req.user.name} added you to the project: ${project.name}`,
            projectId,
            link: `/projects/${projectId}`
        });
    }

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update member role
// @route   PUT /api/projects/:projectId/members/:userId
// @access  Private
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Project owners and admins can change member roles (with restrictions)
    const userRole = await getUserProjectRole(req.user.id, projectId);
    if (!userRole || (userRole.toLowerCase() !== 'owner' && userRole.toLowerCase() !== 'admin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only project owners and admins can change member roles' 
      });
    }

    // Get target member's role to enforce hierarchy
    const targetMember = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!targetMember) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Admins cannot change roles of owners or other admins
    if (userRole.toLowerCase() === 'admin') {
      if (targetMember.role.toLowerCase() === 'owner' || targetMember.role.toLowerCase() === 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Admins can only change roles of members, not owners or other admins' 
        });
      }
    }

    const member = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    member.role = role;
    await member.save();

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:projectId/members/:userId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Check permissions for removing members
    const userRole = await getUserProjectRole(req.user.id, projectId);
    if (!userRole) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a member of this project' 
      });
    }

    // Get target member's role to enforce hierarchy
    const targetMember = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!targetMember) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Owners can remove anyone (except themselves)
    // Admins can remove members (but not other admins/owners)
    // Members cannot remove anyone
    if (userRole.toLowerCase() === 'owner') {
      // Owner can remove anyone except themselves
      if (req.user.id === userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot remove yourself from project. Use leave project instead.' 
        });
      }
    } else if (userRole.toLowerCase() === 'admin') {
      // Admin can remove members and other admins, but not owners
      if (targetMember.role.toLowerCase() === 'owner') {
        return res.status(403).json({ 
          success: false, 
          message: 'Admins cannot remove project owners' 
        });
      }
    } else {
      // Members cannot remove anyone
      return res.status(403).json({ 
        success: false, 
        message: 'Members do not have permission to remove other members' 
      });
    }

    const member = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    await member.destroy();

    res.status(200).json({ success: true, message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProjectMembers,
  addMember,
  updateMemberRole,
  removeMember
};
