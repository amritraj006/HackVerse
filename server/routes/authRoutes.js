const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidationRules, loginValidationRules } = require('../validations/authValidation');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authRateLimiter, registerValidationRules, register);
router.post('/register', authRateLimiter, registerValidationRules, register);
router.post('/login', authRateLimiter, loginValidationRules, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
