const { Project, User, ProjectMember, Task } = require('../models');
const { Op, fn, col } = require('sequelize');
const { logActivity } = require('../utils/activity');
const { emitToProject } = require('../socket');

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { ownerId: req.user.id },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ]
    });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, color, key } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      color,
      key,
      ownerId: req.user.id
    });

    // Create owner as the first member
    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      role: 'admin'
    });

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: project.id,
      action: 'created_project',
      details: `Created project ${name}`
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { name, description, color, status, key } = req.body;
    let project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check ownership or admin
    const member = await ProjectMember.findOne({ where: { projectId: project.id, userId: req.user.id } });
    const isAdmin = member && member.role === 'admin';
    if (project.ownerId !== req.user.id && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    project = await project.update({ name, description, color, status, key });

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: project.id,
      action: 'updated_project',
      details: `Updated project ${project.name}`
    });

    // Emit via Socket
    const fullProject = await Project.findByPk(project.id, {
        include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
    });
    emitToProject(project.id, 'project_updated', { project: fullProject, userId: req.user.id });

    res.status(200).json({ success: true, data: fullProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check ownership or admin
    const member = await ProjectMember.findOne({ where: { projectId: project.id, userId: req.user.id } });
    const isAdmin = member && member.role === 'admin';
    if (project.ownerId !== req.user.id && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    const projectId = project.id;
    await project.destroy();

    // Emit via Socket
    emitToProject(projectId, 'project_deleted', { projectId, userId: req.user.id });

    res.status(200).json({ success: true, message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get project analytics
// @route   GET /api/projects/:projectId/analytics
// @access  Private
const getProjectAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Task Distribution by Status
    const statusDistribution = await Task.findAll({
      where: { projectId: id },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });

    // 2. Priority Distribution
    const priorityDistribution = await Task.findAll({
      where: { projectId: id },
      attributes: [
        'priority',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['priority']
    });

    // 3. Daily Completion Stats (Last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const completionTrend = await Task.findAll({
      where: {
        projectId: id,
        status: { [Op.in]: ['done', 'completed'] },
        updatedAt: { [Op.gte]: fourteenDaysAgo }
      },
      attributes: [
        [fn('date_trunc', 'day', col('updatedAt')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('date_trunc', 'day', col('updatedAt'))],
      order: [[fn('date_trunc', 'day', col('updatedAt')), 'ASC']]
    });

    // 4. Team Workload
    const teamWorkload = await Task.findAll({
      where: { projectId: id },
      attributes: [
        'assigneeId',
        [fn('COUNT', col('id')), 'count']
      ],
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar'] }
      ],
      group: ['assigneeId', 'assignee.id', 'assignee.name']
    });

    // 5. Overall Stats
    const totalTasks = await Task.count({ where: { projectId: id } });
    const completedTasks = await Task.count({ 
      where: { 
        projectId: id, 
        status: { [Op.in]: ['done', 'completed'] } 
      } 
    });

    res.status(200).json({
      success: true,
      data: {
        statusDistribution,
        priorityDistribution,
        completionTrend,
        teamWorkload,
        summary: {
          totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  getProjectAnalytics,
  createProject,
  updateProject,
  deleteProject
};
