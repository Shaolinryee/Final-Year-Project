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
  deleteComment,
  updateComment,
  toggleReaction
} = require('../controllers/commentController');
const {
  uploadAttachment,
  getTaskAttachments,
  deleteAttachment
} = require('../controllers/attachmentController');
const upload = require('../config/multer');
const auth = require('../middleware/auth');
const { requireProjectAdmin, requireProjectMember } = require('../middleware/rbac');

// All task routes are protected
router.use(auth);

// Member routes (view tasks)
router.get('/project/:projectId', requireProjectMember, getTasksByProject);
router.get('/search/query', searchTasks);
router.get('/:id', getTaskById);

// Admin or Owner routes (create, edit, delete tasks)
router.post('/', createTask); // Will need projectId in body, check in controller
router.put('/:id', updateTask); // Will need to check project membership via task
router.delete('/:id', deleteTask); // Will need to check project membership via task

// Comment Routes (all members can comment)
router.get('/:taskId/comments', getTaskComments);
router.post('/:taskId/comments', addComment);
router.put('/:taskId/comments/:commentId', updateComment);
router.delete('/:taskId/comments/:commentId', deleteComment);
router.post('/:taskId/comments/:commentId/react', toggleReaction);

// Attachment Routes (all members can upload/attachments)
router.get('/:taskId/attachments', getTaskAttachments);
router.post('/:taskId/attachments', upload.single('file'), uploadAttachment);
router.delete('/attachments/:attachmentId', deleteAttachment);

module.exports = router;
