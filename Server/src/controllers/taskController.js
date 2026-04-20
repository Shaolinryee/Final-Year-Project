const { Task, Project, User, Attachment, Comment, ProjectMember } = require('../models');
const { Op } = require('sequelize');
const { logActivity } = require('../utils/activity');
const { sendNotification } = require('../utils/notification');
const { emitToProject } = require('../socket');
const { getUserProjectRole } = require('../middleware/rbac');

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { 
          model: Comment, 
          as: 'comments', 
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
            { model: Attachment, as: 'attachments' }
          ] 
        },
        { 
          model: Attachment, 
          as: 'attachments',
          where: { commentId: null },
          required: false,
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search and filter tasks
// @route   GET /api/tasks/search/query
// @access  Private
const searchTasks = async (req, res) => {
  try {
    const { q, projectId, assigneeId, status, priority, startDate, endDate } = req.query;
    const userId = req.user.id;

    const where = {};

    // Filter by project (if provided) or all projects user belongs to
    if (projectId) {
      where.projectId = projectId;
    } else {
      // Find all projects user belongs to
      const memberships = await ProjectMember.findAll({ where: { userId } });
      const projectIds = memberships.map(m => m.projectId);
      
      if (projectIds.length === 0) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      
      where.projectId = { [Op.in]: projectIds };
    }

    // Full-text search on title/description
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Specific filters
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Date range
    if (startDate && endDate) {
      where.dueDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.dueDate = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.dueDate = { [Op.lte]: new Date(endDate) };
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'color'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assigneeId, status, priority, dueDate, tags } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and Project ID are required' });
    }

    // Check if user has permission to create tasks (admin or owner)
    const userRole = await getUserProjectRole(req.user.id, projectId);
    if (!userRole || (userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'owner')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only project admins and owners can create tasks' 
      });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assigneeId,
      creatorId: req.user.id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      tags: tags || []
    });

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId,
      taskId: task.id,
      action: 'created_task',
      details: `Created task ${title}`
    });

    // Notify assignee
    if (assigneeId && assigneeId !== req.user.id) {
        const project = await Project.findByPk(projectId);
        await sendNotification({
            userId: assigneeId,
            type: 'task_assigned',
            title: 'New Task Assigned',
            message: `${req.user.name} assigned you a task: ${title} in ${project?.name || 'project'}`,
            projectId,
            taskId: task.id,
            link: `/projects/${projectId}/tasks/${task.id}`
        });
    }

    // Emit via Socket
    const fullTask = await Task.findByPk(task.id, {
        include: [
            { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ]
    });
    emitToProject(projectId, 'task_created', { task: fullTask, userId: req.user.id });

    res.status(201).json({ success: true, data: fullTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if user has permission to update this task
    const userRole = await getUserProjectRole(req.user.id, task.projectId);
    if (!userRole) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a member of this project' 
      });
    }

    // Allow update if user is admin/owner OR any project member for basic updates
    const isAdminOrOwner = userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'owner';
    
    // Allow any project member to update basic task properties (status, priority, assignee)
    // Only restrict structural changes (title, description, etc.) to admins/owners
    const isBasicUpdate = req.body.status || req.body.priority || req.body.assigneeId !== undefined;
    
    if (!isAdminOrOwner && !isBasicUpdate) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only project admins, owners, or members can perform this update' 
      });
    }

    const oldStatus = task.status;
    const oldAssigneeId = task.assigneeId;

    task = await task.update(req.body);

    // Log status change
    if (req.body.status && req.body.status !== oldStatus) {
      await logActivity({
        userId: req.user.id,
        projectId: task.projectId,
        taskId: task.id,
        action: 'status_changed',
        details: `Updated task status to ${req.body.status}`
      });
    }

    // Log assignment
    if (req.body.assigneeId && req.body.assigneeId !== oldAssigneeId) {
      let assigneeName = 'user';
      if (req.body.assigneeId === req.user.id) {
        assigneeName = 'oneself';
      } else {
        const assigneeUser = await User.findByPk(req.body.assigneeId);
        if (assigneeUser) {
          assigneeName = assigneeUser.name;
        }
      }

      await logActivity({
        userId: req.user.id,
        projectId: task.projectId,
        taskId: task.id,
        action: 'assigned',
        details: `Assigned task to ${assigneeName}`
      });

      // Notify new assignee
      if (req.body.assigneeId !== req.user.id) {
          const project = await Project.findByPk(task.projectId);
          await sendNotification({
              userId: req.body.assigneeId,
              type: 'task_assigned',
              title: 'Task Assigned',
              message: `${req.user.name} assigned you the task: ${task.title} in ${project?.name || 'project'}`,
              projectId: task.projectId,
              taskId: task.id,
              link: `/projects/${task.projectId}/tasks/${task.id}`
          });
      }
    }

    // Notify creator when task is completed
    if (req.body.status === 'done' && oldStatus !== 'done' && task.creatorId !== req.user.id) {
        await sendNotification({
            userId: task.creatorId,
            type: 'task_completed',
            title: 'Task Completed',
            message: `${req.user.name} completed the task: ${task.title}`,
            projectId: task.projectId,
            taskId: task.id,
            link: `/projects/${task.projectId}/tasks/${task.id}`
        });
    }

    // Emit via Socket
    const fullTask = await Task.findByPk(task.id, {
        include: [
            { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ]
    });
    emitToProject(task.projectId, 'task_updated', { task: fullTask, userId: req.user.id });

    res.status(200).json({ success: true, data: fullTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if user has permission to delete this task (admin or owner only)
    const userRole = await getUserProjectRole(req.user.id, task.projectId);
    if (!userRole || (userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'owner')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only project admins and owners can delete tasks' 
      });
    }

    const projectId = task.projectId;
    const taskId = task.id;
    await task.destroy();

    // Emit via Socket
    emitToProject(projectId, 'task_deleted', { taskId, projectId, userId: req.user.id });

    res.status(200).json({ success: true, message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTasksByProject,
  getTaskById,
  searchTasks,
  createTask,
  updateTask,
  deleteTask
};
