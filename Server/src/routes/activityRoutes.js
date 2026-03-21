const express = require('express');
const router = express.Router();
const {
  getProjectActivities,
  getTaskActivities
} = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/project/:projectId', getProjectActivities);
router.get('/task/:taskId', getTaskActivities);

module.exports = router;
