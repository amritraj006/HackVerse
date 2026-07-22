const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserProfile,
  getCurrentProfile,
  updateProfile,
  uploadAvatar,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Profile routes
router.get('/profile', protect, getCurrentProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), uploadAvatar);

// Admin user management
router.get('/', protect, authorize('admin'), getUsers);

// Public profile by ID (Keep last to avoid route conflict)
router.get('/:id', getUserProfile);

module.exports = router;
