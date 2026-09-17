import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAiStatus,
  listModels,
  generateHackathonDescription,
  generateGeneralText,
} from '../controllers/aiController.js';

const router = express.Router();

// AI status check
router.get('/status', protect, getAiStatus);

// List all models available for this API key that support generateContent
router.get('/models', protect, listModels);

// Generate hackathon description (organizers and admins only)
router.post(
  '/hackathon-description',
  protect,
  authorize('organizer', 'admin'),
  generateHackathonDescription
);

// General-purpose text generation for future modules
router.post('/generate', protect, generateGeneralText);

export default router;
