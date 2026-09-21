import cors from 'cors';

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin
    // (Postman, mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },

  credentials: true,
});

export default corsMiddleware;

