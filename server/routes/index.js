const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const hackathonRoutes = require('./hackathonRoutes');
const userRoutes = require('./userRoutes');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'HackVerse API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Route registration
router.use('/auth', authRoutes);
router.use('/hackathons', hackathonRoutes);
router.use('/users', userRoutes);

module.exports = router;
