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

// All project routes are protected
router.use(auth);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/analytics', getProjectAnalytics);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Member Routes
router.get('/:projectId/members', getProjectMembers);
router.post('/:projectId/members', addMember);
router.put('/:projectId/members/:userId', updateMemberRole);
router.delete('/:projectId/members/:userId', removeMember);

module.exports = router;
