import express from 'express';
import authRoutes from './authRoutes.js';
import hackathonRoutes from './hackathonRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import registrationRoutes from './registrationRoutes.js';
import teamRoutes from './teamRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import aiRoutes from './aiRoutes.js';
import uploadService from '../services/uploadService.js';

const router = express.Router();

// API Health Check with Circuit Breaker and Process Status
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'HackVerse API is running smoothly',
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptimeSeconds: Math.floor(process.uptime()),
    },
    circuitBreakers: {
      cloudinary: uploadService.getCircuitStatus(),
    },
  });
});

// Route registration
router.use('/auth', authRoutes);
router.use('/hackathons', hackathonRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/registrations', registrationRoutes);
router.use('/teams', teamRoutes);
router.use('/submissions', submissionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);

export default router;
