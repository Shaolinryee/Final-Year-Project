const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  getProjectAnalytics,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const {
  getProjectMembers,
  addMember,
  updateMemberRole,
  removeMember
} = require('../controllers/memberController');
const auth = require('../middleware/auth');
const { requireProjectOwner, requireProjectAdmin, requireProjectMember } = require('../middleware/rbac');

// All project routes are protected
router.use(auth);

// Public project routes (for members)
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/analytics', getProjectAnalytics);

// Owner-only routes
router.post('/', createProject);
router.delete('/:id', requireProjectOwner, deleteProject);

// Admin or Owner routes
router.put('/:id', requireProjectAdmin, updateProject);

// Member Routes
router.get('/:projectId/members', requireProjectMember, getProjectMembers);
router.post('/:projectId/members', requireProjectAdmin, addMember);
router.put('/:projectId/members/:userId', requireProjectOwner, updateMemberRole);
router.delete('/:projectId/members/:userId', requireProjectAdmin, removeMember);

module.exports = router;
