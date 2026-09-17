import express from 'express';
import {
  getUsers,
  getUserProfile,
  getCurrentProfile,
  updateProfile,
  uploadAvatar,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Profile routes
router.get('/profile', protect, getCurrentProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/avatar', protect, uploadRateLimiter, upload.single('avatar'), uploadAvatar);

// Admin & Organizer: list users (organizers need this for judge assignment)
router.get('/', protect, authorize('admin', 'organizer'), getUsers);

// Public profile by ID (Keep last to avoid route conflict)
router.get('/:id', getUserProfile);

export default router;
