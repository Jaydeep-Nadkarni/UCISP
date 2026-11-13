import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ucisp';

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri,
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  schedulerPolicy: process.env.SCHEDULER_POLICY || 'priority'
};
