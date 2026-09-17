import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidationRules, loginValidationRules } from '../validations/authValidation.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', authRateLimiter, registerValidationRules, register);
router.post('/register', authRateLimiter, registerValidationRules, register);
router.post('/login', authRateLimiter, loginValidationRules, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
