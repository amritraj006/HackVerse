require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const { startHackathonScheduler } = require('./utils/hackathonScheduler');

const PORT = process.env.PORT || 8341;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Initialize database seeder and background scheduler
    await seedAdmin();
    startHackathonScheduler();

    const server = app.listen(PORT, () => {
      console.log(`[Server] HackVerse API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown handling
    const shutdown = (signal) => {
      console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
