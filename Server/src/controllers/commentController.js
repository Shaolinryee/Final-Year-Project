const { Comment, User, Task, Project } = require('../models');
const { sendNotification } = require('../utils/notification');
const { emitToProject } = require('../socket');
const { logActivity } = require('../utils/activity');

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const comments = await Comment.findAll({
      where: { taskId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const comment = await Comment.create({
      taskId,
      userId: req.user.id,
      text
    });

    // Return with user data
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }
      ]
    });

    // Notify assignee and creator
    const notifyUserIds = new Set();
    if (task.assigneeId) notifyUserIds.add(task.assigneeId);
    if (task.creatorId) notifyUserIds.add(task.creatorId);
    notifyUserIds.delete(req.user.id);

    if (notifyUserIds.size > 0) {
        const project = await Project.findByPk(task.projectId);
        for (const userId of notifyUserIds) {
            await sendNotification({
                userId,
                type: 'comment_added',
                title: 'New Comment',
                message: `${req.user.name} commented on task: ${task.title}`,
                projectId: task.projectId,
                taskId: task.id,
                link: `/projects/${task.projectId}/tasks/${task.id}`,
                tab: 'watching'
            });
        }
    }

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: task.projectId,
      taskId: task.id,
      action: 'added_comment',
      details: `Commented on task: ${task.title}`
    });

    // Emit via Socket
    emitToProject(task.projectId, 'comment_created', { comment: fullComment, taskId: task.id, userId: req.user.id });

    res.status(201).json({ success: true, data: fullComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/tasks/:taskId/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { commentId, taskId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.userId !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    const task = await Task.findByPk(taskId);
    const projectId = task?.projectId;

    await comment.destroy();

    // Emit via Socket
    if (projectId) {
      emitToProject(projectId, 'comment_deleted', { commentId, taskId, userId: req.user.id });
    }

    res.status(200).json({ success: true, message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTaskComments,
  addComment,
  deleteComment
};
