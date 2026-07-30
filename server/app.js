const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Allowed origins (environment variable + fallback localhost ports)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

// Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

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

// Error handling middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;