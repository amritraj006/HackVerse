const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  toggleBlockUser,
  updateUserRole,
  deleteUser,
  getHackathons,
  deleteHackathon,
  getSubmissions,
  deleteSubmission,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

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

module.exports = router;
