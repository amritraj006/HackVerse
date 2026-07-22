const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidationRules, loginValidationRules } = require('../validations/authValidation');

router.post('/signup', registerValidationRules, register);
router.post('/register', registerValidationRules, register);
router.post('/login', loginValidationRules, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
