const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const hackathonRoutes = require('./hackathonRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');
const registrationRoutes = require('./registrationRoutes');
const teamRoutes = require('./teamRoutes');
const submissionRoutes = require('./submissionRoutes');

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
router.use('/admin', adminRoutes);
router.use('/registrations', registrationRoutes);
router.use('/teams', teamRoutes);
router.use('/submissions', submissionRoutes);

module.exports = router;
