import express from 'express';
import {
  getAnalytics,
  getUsers,
  toggleBlockUser,
  updateUserRole,
  deleteUser,
  getHackathons,
  deleteHackathon,
  getSubmissions,
  deleteSubmission,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and Admin role
router.use(protect, authorize('admin'));

// Analytics endpoint
router.get('/analytics', getAnalytics);

// User Management routes
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Hackathon Management routes
router.get('/hackathons', getHackathons);
router.delete('/hackathons/:id', deleteHackathon);

// Submission Management routes
router.get('/submissions', getSubmissions);
router.delete('/submissions/:id', deleteSubmission);

export default router;
