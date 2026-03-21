const express = require('express');
const router = express.Router();
const {
  getTasksByProject,
  getTaskById,
  searchTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const {
  getTaskComments,
  addComment,
  deleteComment
} = require('../controllers/commentController');
const {
  uploadAttachment,
  getTaskAttachments,
  deleteAttachment
} = require('../controllers/attachmentController');
const upload = require('../config/multer');
const auth = require('../middleware/auth');

// All task routes are protected
router.use(auth);

router.get('/project/:projectId', getTasksByProject);
router.get('/search/query', searchTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Comment Routes
router.get('/:taskId/comments', getTaskComments);
router.post('/:taskId/comments', addComment);
router.delete('/:taskId/comments/:commentId', deleteComment);

// Attachment Routes
router.get('/:taskId/attachments', getTaskAttachments);
router.post('/:taskId/attachments', upload.single('file'), uploadAttachment);
router.delete('/attachments/:attachmentId', deleteAttachment);

module.exports = router;
