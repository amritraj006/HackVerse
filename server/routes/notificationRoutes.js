const express = require('express');
const router = express.Router();
const {
  getNotifications,
  acceptInvitation,
  rejectInvitation,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.post('/:id/accept', acceptInvitation);
router.post('/:id/reject', rejectInvitation);

module.exports = router;
