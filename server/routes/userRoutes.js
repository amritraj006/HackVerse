const express = require('express');
const router = express.Router();
const { getUsers, getUserProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', getUserProfile);

module.exports = router;
