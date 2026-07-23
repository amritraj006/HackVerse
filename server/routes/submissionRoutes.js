const express = require('express');
const router = express.Router();
const {
  submitProject,
  getMySubmissions,
  getAllSubmissions,
  getHackathonSubmissions,
  getSubmissionById,
  deleteSubmission,
  getAssignedSubmissions,
  submitEvaluation,
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public showcase & single submission detail
router.get('/', getAllSubmissions);

// Judge evaluation workspace. These must precede the dynamic /:id route.
router.get('/assigned', protect, authorize('judge', 'admin'), getAssignedSubmissions);
router.post('/:id/evaluations', protect, authorize('judge', 'admin'), submitEvaluation);
router.get('/my-submissions', protect, getMySubmissions);
router.get('/hackathon/:hackathonId', protect, getHackathonSubmissions);

// Create / Update project submission with file uploads
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'presentationFile', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 },
  ]),
  submitProject
);

router.delete('/:id', protect, deleteSubmission);

// Keep the project detail publicly accessible, but after all named routes.
router.get('/:id', getSubmissionById);

module.exports = router;
