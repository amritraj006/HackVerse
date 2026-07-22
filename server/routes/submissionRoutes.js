const express = require('express');
const router = express.Router();
const {
  submitProject,
  getMySubmissions,
  getAllSubmissions,
  getHackathonSubmissions,
  getSubmissionById,
  deleteSubmission,
} = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public showcase & single submission detail
router.get('/', getAllSubmissions);
router.get('/:id', getSubmissionById);

// Protected routes
router.use(protect);

router.get('/my-submissions', getMySubmissions);
router.get('/hackathon/:hackathonId', getHackathonSubmissions);

// Create / Update project submission with file uploads
router.post(
  '/',
  upload.fields([
    { name: 'presentationFile', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 },
  ]),
  submitProject
);

router.delete('/:id', deleteSubmission);

module.exports = router;
