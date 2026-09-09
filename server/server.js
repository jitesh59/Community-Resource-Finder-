import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import authRoutes from './routes/authRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 8080;

// Configure Helmet with relaxed cross-origin policies for API deployment
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false
  })
);

// Bulletproof CORS setup for cross-domain API calls (Vercel <-> Render)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-session-id', 'Authorization']
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health check endpoints for Render / Uptime monitors
app.get(['/', '/health', '/api/health'], (_req, res) => {
  res.json({
    ok: true,
    service: 'community-resource-finder-api',
    status: 'Operational',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/chat', chatRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/auth', authRoutes);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});

await connectDatabase();
