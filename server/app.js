const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HackVerse Backend API Server',
    documentation: '/api/v1/health',
  });
});

// API v1 master routes
app.use('/api/v1', apiRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
