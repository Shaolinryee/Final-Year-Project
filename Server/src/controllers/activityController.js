const { Activity, User, Task, Project } = require('../models');

// @desc    Get activities for a project
// @route   GET /api/activities/project/:projectId
// @access  Private
const getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const activities = await Activity.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
        { model: Task, as: 'task', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get activities for a task
// @route   GET /api/activities/task/:taskId
// @access  Private
const getTaskActivities = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const activities = await Activity.findAll({
      where: { taskId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProjectActivities,
  getTaskActivities
};
