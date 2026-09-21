import express from 'express';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import apiRoutes from './routes/index.js';

import corsMiddleware from './middleware/corsMiddleware.js';
import {
  notFoundHandler,
  globalErrorHandler,
} from './middleware/errorMiddleware.js';

import { globalApiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust reverse proxy (Nginx, Docker bridge)
// for accurate client IP identification in rate limiters
app.set('trust proxy', 1);

// HTTP request logger
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')
);

// CORS
app.use(corsMiddleware);

// Body parsing
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

// API v1 master routes with global rate limiter
app.use('/api/v1', globalApiLimiter, apiRoutes);

// Error handling middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

export { app };

export default app;

