require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const { startHackathonScheduler } = require('./utils/hackathonScheduler');

const PORT = process.env.PORT || 8341;
const isClusterEnabled = process.env.CLUSTER_MODE === 'true';

// Number of worker processes to fork in cluster mode
const getNumWorkers = () => {
  if (process.env.WEB_CONCURRENCY) {
    return parseInt(process.env.WEB_CONCURRENCY, 10);
  }
  const cpus = os.cpus().length;
  // Default to 2 workers in local dev/containers, or CPU count up to 4
  return Math.min(Math.max(cpus, 2), 4);
};

const startWorkerInstance = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    const workerTag = isClusterEnabled ? `[Worker ${process.pid}]` : '[Server]';
    console.log(`${workerTag} HackVerse API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`${workerTag} Health check: http://localhost:${PORT}/api/v1/health`);
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    console.log(`[Worker ${process.pid}] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log(`[Worker ${process.pid}] HTTP server closed.`);
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

const startCluster = async () => {
  if (isClusterEnabled && cluster.isPrimary) {
    const numWorkers = getNumWorkers();
    console.log(`[LoadBalancer/Cluster] Primary master process ${process.pid} running.`);
    console.log(`[LoadBalancer/Cluster] Forking ${numWorkers} worker processes for round-robin load distribution...`);

    // Connect to database and run singletons (seeder & scheduler) strictly once on primary
    await connectDB();
    await seedAdmin();
    startHackathonScheduler();

    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
      const worker = cluster.fork();
      console.log(`[LoadBalancer/Cluster] Spawned worker process ${worker.process.pid} (#${i + 1}/${numWorkers})`);
    }

    // Auto-revive dead workers for high availability
    cluster.on('exit', (worker, code, signal) => {
      const reason = signal || `exit code ${code}`;
      console.warn(`[LoadBalancer/Cluster] Worker ${worker.process.pid} died (${reason}). Spawning replacement...`);
      const newWorker = cluster.fork();
      console.log(`[LoadBalancer/Cluster] Replacement worker ${newWorker.process.pid} is now active.`);
    });
  } else {
    // Single-instance mode or clustered worker process
    if (!isClusterEnabled) {
      await connectDB();
      await seedAdmin();
      startHackathonScheduler();
    }
    await startWorkerInstance();
  }
};

startCluster();
