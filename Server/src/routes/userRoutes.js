const express = require('express');
const router = express.Router();
const {
  getMe,
  getUserById,
  searchUsers,
  updateProfile
} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/me', getMe);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);

module.exports = router;
