const { ProjectMember, User, Project } = require('../models');
const { sendNotification } = require('../utils/notification');

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

    // Check if caller is owner or admin of project (simplified for now)
    if (project.ownerId !== req.user.id) {
       // Also check if admin member
       const adminCheck = await ProjectMember.findOne({ where: { projectId, userId: req.user.id, role: 'admin' } });
       if (!adminCheck) {
         return res.status(403).json({ success: false, message: 'Not authorized to add members' });
       }
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

    // Authorization check (simplified)
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
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

    // Authorization check
    if (project.ownerId !== req.user.id && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
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
