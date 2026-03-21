const { Attachment, Task, User } = require('../models');
const { emitToProject } = require('../socket');
const { logActivity } = require('../utils/activity');
const path = require('path');
const fs = require('fs');

// @desc    Upload file and attach to task
// @route   POST /api/tasks/:taskId/attachments
// @access  Private
const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const attachment = await Attachment.create({
      taskId,
      userId: req.user.id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`, // Serve this via static middleware
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    const fullAttachment = await Attachment.findByPk(attachment.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
    });

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: task.projectId,
      taskId: task.id,
      action: 'uploaded_attachment',
      details: `Uploaded attachment: ${req.file.originalname}`
    });

    // Emit via Socket
    emitToProject(task.projectId, 'attachment_created', { attachment: fullAttachment, taskId, userId: req.user.id });

    res.status(201).json({ success: true, data: fullAttachment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get task attachments
// @route   GET /api/tasks/:taskId/attachments
// @access  Private
const getTaskAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const attachments = await Attachment.findAll({
      where: { taskId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: attachments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete attachment
// @route   DELETE /api/tasks/attachments/:attachmentId
// @access  Private
const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await Attachment.findByPk(attachmentId);
    if (!attachment) return res.status(404).json({ success: false, message: 'Attachment not found' });

    // Authorization: only task owner or creator? (simplified for now)
    
    // Delete physical file
    const filePath = path.join(__dirname, '../../uploads', path.basename(attachment.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const task = await Task.findByPk(attachment.taskId);
    
    // Log Activity
    if (task) {
      await logActivity({
        userId: req.user.id,
        projectId: task.projectId,
        taskId: task.id,
        action: 'deleted_attachment',
        details: `Deleted attachment: ${attachment.fileName}`
      });
    }

    await attachment.destroy();

    // Emit via Socket
    if (task) {
      emitToProject(task.projectId, 'attachment_deleted', { attachmentId, taskId, userId: req.user.id });
    }

    res.status(200).json({ success: true, message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadAttachment,
  getTaskAttachments,
  deleteAttachment
};
