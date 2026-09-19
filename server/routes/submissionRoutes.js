import express from 'express';
import {
  submitProject,
  updateSubmission,
  getMySubmissions,
  getAllSubmissions,
  getHackathonSubmissions,
  getSubmissionById,
  deleteSubmission,
  getAssignedSubmissions,
  submitEvaluation,
  declareWinner,
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public showcase & single submission detail
router.get('/', getAllSubmissions);

// Judge evaluation workspace. These must precede the dynamic /:id route.
router.get('/assigned', protect, authorize('judge', 'admin'), getAssignedSubmissions);
router.post('/:id/evaluations', protect, authorize('judge', 'admin'), submitEvaluation);
router.put('/:id/winner', protect, authorize('judge', 'organizer', 'admin'), declareWinner);
router.get('/my-submissions', protect, getMySubmissions);
router.get('/hackathon/:hackathonId', protect, getHackathonSubmissions);

// Create / Update project submission with file uploads
router.post(
  '/',
  protect,
  uploadRateLimiter,
  upload.fields([
    { name: 'presentationFile', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 },
  ]),
  submitProject
);

router.delete('/:id', protect, deleteSubmission);

// Update an existing submission
router.put(
  '/:id',
  protect,
  uploadRateLimiter,
  upload.fields([
    { name: 'presentationFile', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 },
  ]),
  updateSubmission
);

// Keep the project detail publicly accessible, but after all named routes.
router.get('/:id', getSubmissionById);

export default router;
