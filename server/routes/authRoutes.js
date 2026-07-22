const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidationRules, loginValidationRules } = require('../validations/authValidation');

router.post('/register', registerValidationRules, register);
router.post('/login', loginValidationRules, login);
router.get('/me', protect, getMe);

module.exports = router;
