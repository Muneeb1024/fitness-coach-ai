import dotenv from 'dotenv';
dotenv.config(); // MUST be first — loads .env before any other module initializes

// Startup environment guard — warns (never blocks) about weak/missing secrets.
(function checkEnvironmentSecrets() {
  const jwtSecret = process.env.JWT_SECRET || '';
  if (!jwtSecret) {
    console.warn('\x1b[33m[Security]\x1b[0m JWT_SECRET is not set — signing in will fail. Set a strong random secret.');
  } else if (jwtSecret.length < 32) {
    console.warn('\x1b[33m[Security]\x1b[0m JWT_SECRET is shorter than 32 characters — use a long random string in production.');
  }
  if (!process.env.MONGO_URI) {
    console.warn('\x1b[33m[Security]\x1b[0m MONGO_URI is not set — running on the in-memory fallback store only.');
  }
})();

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import planRoutes from './routes/planRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import { setSocketIo } from './services/socketEmitter.js';

const app = express();
const server = http.createServer(app);

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS: allow the frontend dev server + any extra origins via env (comma-separated).
// ALLOWED_ORIGINS is the canonical variable; CORS_ORIGINS is kept as a fallback
// for compatibility with earlier deployments.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow same-origin / non-browser clients (curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  }
}));

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// Give controllers access to emit live events (plan overrides, etc.)
setSocketIo(io);

// Extra hardening headers on top of helmet (CSP stays disabled intentionally —
// the SPA injects inline styles; revisit when a non-inline build is adopted).
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Body parsers — tight default JSON limit (413 on overflow). Routes that
// legitimately carry base64 image payloads (food photo logs, user photos)
// opt into a larger limit via path-scoped parsers registered first.
app.use('/api/food', express.json({ limit: '25mb' }));
app.use('/api/user', express.json({ limit: '25mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : res.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${res.statusCode}]\x1b[0m ${req.method} ${req.path} • ${ms}ms`);
  });
  next();
});

// Database connection (skipped under `npm test` — the suite runs against the
// in-memory fallback store and must never touch the shared MongoDB).
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AI Fitness Coach API v1',
    version: '2.0.0',
    time: new Date().toISOString()
  });
});

// Versioned API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/insight', insightRoutes);
app.use('/api/food', foodRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log(`\x1b[36m[Socket.IO]\x1b[0m Client connected: ${socket.id}`);

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`\x1b[36m[Socket.IO]\x1b[0m ${socket.id} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`\x1b[33m[Socket.IO]\x1b[0m Client disconnected: ${socket.id}`);
  });
});

// Export io for use in controllers
export { io };

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler — never leaks stack traces outside development,
// and body-parser size overflows surface as a clean JSON 413.
app.use((err, req, res, next) => {
  const isPayloadTooLarge = err.type === 'entity.too.large' || err.status === 413;
  const status = isPayloadTooLarge ? 413 : (err.status || err.statusCode || 500);
  console.error(`\x1b[31m[Global Error]\x1b[0m ${status}:`, err.message);
  res.status(status).json({
    success: false,
    message: isPayloadTooLarge
      ? 'Request body too large.'
      : (status >= 500 ? 'Internal Server Error' : (err.message || 'Request failed')),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});



const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(
                `[Server Ready] AI Fitness Coach API running on port ${PORT}`
            );
        });
    } catch (error) {
        console.error('[Startup Error] Failed to start server.');
        process.exit(1);
    }
};

// Export the app + HTTP server so the test suite can boot its own listener on
// an ephemeral port (see test/helpers.mjs).
export { app, server };

// Auto-start only when run directly (npm start / node src/server.js). Under
// `npm test` the suite imports the app and listens itself.
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (process.env.NODE_ENV !== 'test' && isDirectRun) {
  startServer();
}