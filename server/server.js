require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8341;

// Connect Database & Start HTTP Server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Server] HackVerse API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/v1/health`);
  });
};

startServer();
