const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/stats', protect, dashboardController.getDashboardStats);

module.exports = router;
