import express from 'express';
import {
  getNotifications,
  acceptInvitation,
  rejectInvitation,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.post('/:id/accept', acceptInvitation);
router.post('/:id/reject', rejectInvitation);

export default router;
