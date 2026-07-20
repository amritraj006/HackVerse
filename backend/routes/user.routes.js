const express = require('express');
const userController = require('../controllers/user.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/', protect, authorizeRoles(ROLES.ADMIN), userController.getAllUsers);
router.get('/judges', protect, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), userController.getJudges);

module.exports = router;
