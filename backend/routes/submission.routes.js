const express = require('express');
const submissionController = require('../controllers/submission.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { createSubmissionSchema } = require('../validations/submission.validation');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.post(
  '/',
  protect,
  // Multer middleware must process file fields before validation so req.body fields are populated
  upload.fields([
    { name: 'presentationPdf', maxCount: 1 },
    { name: 'screenshots', maxCount: 4 },
  ]),
  validate(createSubmissionSchema),
  submissionController.createOrUpdateSubmission
);

router.get('/:id', protect, submissionController.getSubmissionDetails);
router.get('/team/:teamId', protect, submissionController.getTeamSubmission);

router.get(
  '/hackathon/:hackathonId',
  protect,
  authorizeRoles(ROLES.ORGANIZER, ROLES.JUDGE, ROLES.ADMIN),
  submissionController.getHackathonSubmissions
);

module.exports = router;
