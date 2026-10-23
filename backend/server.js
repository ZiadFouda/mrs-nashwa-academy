const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cluster = require('cluster');
const os = require('os');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { db, logAudit } = require('./database/db');
const { initDatabase } = require('./database/init');
const { cors, corsOptions, helmetConfig, sanitizeInput } = require('./middleware/security');
const { apiRateLimiter, JWT_SECRET } = require('./middleware/auth');

// Cluster mode handling for high concurrency (300+ simultaneous students)
const ENABLE_CLUSTER = process.env.ENABLE_CLUSTER === 'true';

if (ENABLE_CLUSTER && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`[Master ${process.pid}] Launching Mrs. Nashwa Educational Platform Cluster across ${numCPUs} CPUs...`);

  // Initialize DB tables once in primary
  initDatabase();

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[Worker ${worker.process.pid}] died (code: ${code}, signal: ${signal}). Spawning replacement...`);
    cluster.fork();
  });
} else if (require.main === module) {
  // Worker process or single-instance mode (only run directly if not imported as module)
  startServer();
}

function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Initialize Socket.io with secure CORS
  const io = new Server(server, {
    cors: {
      origin: corsOptions.origin,
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Ensure DB initialized in standalone mode
  if (!ENABLE_CLUSTER) {
    initDatabase();
  }

  // Trust proxy for rate limiting behind reverse proxies (Nginx / Cloudflare / Docker)
  app.set('trust proxy', 1);

  // 1. Core Security & Optimization Middlewares
  app.use(helmetConfig);
  app.use(cors);
  app.use(compression({
    level: 6,
    threshold: 1024 // Compress responses above 1KB
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(sanitizeInput);

  // 2. Production Request Logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV !== 'test') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
      }
    });
    next();
  });

  // 3. Static Files Serving
  // Serve uploaded materials (with protected check on material routes, or static public assets)
  const uploadsDir = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads/general', express.static(path.join(uploadsDir, 'general')));

  // 4. Health Check Endpoints
  const healthCheckHandler = (req, res) => {
    try {
      // Test DB connection
      const dbCheck = db.prepare('SELECT 1 as healthy').get();
      return res.status(200).json({
        status: 'UP',
        service: 'Mrs. Nashwa Abdelhalim Educational Platform Backend',
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
        database: dbCheck.healthy === 1 ? 'connected' : 'unhealthy',
        pid: process.pid
      });
    } catch (err) {
      return res.status(503).json({
        status: 'DOWN',
        database: 'disconnected',
        error: err.message
      });
    }
  };

  app.get('/health', healthCheckHandler);
  app.get('/api/health', healthCheckHandler);

  // 5. Mount API Routes with General Rate Limiting
  app.use('/api', apiRateLimiter);
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/courses', require('./routes/courses'));
  app.use('/api/lessons', require('./routes/lessons'));
  app.use('/api/materials', require('./routes/materials'));
  app.use('/api/assignments', require('./routes/assignments'));
  app.use('/api/analytics', require('./routes/analytics'));
  app.use('/api/parent', require('./routes/parent'));
  app.use('/api/payments', require('./routes/payments'));

  // 6. Serve static Frontend build if present (e.g., ../frontend/dist)
  const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');
  if (fs.existsSync(frontendDistPath)) {
    console.log(`Serving frontend static build from ${frontendDistPath}`);
    app.use(express.static(frontendDistPath));
  } else {
    app.get('/', (req, res) => {
      res.status(200).json({
        message: 'Mrs. Nashwa Abdelhalim Educational Platform API is running.',
        docs: '/api/health',
        version: '1.0.0'
      });
    });
  }

  // 7. 404 Route Handler for undefined API endpoints
  app.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.originalUrl} not found.`
    });
  });

  // Client-side routing fallback to frontend index.html if frontend is present
  if (fs.existsSync(frontendDistPath)) {
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.originalUrl.startsWith('/api') && !req.originalUrl.startsWith('/health')) {
        return res.sendFile(path.join(frontendDistPath, 'index.html'));
      }
      next();
    });
  }

  // 8. Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled Application Error:', err);

    const statusCode = err.status || err.statusCode || 500;
    const isProd = process.env.NODE_ENV === 'production';

    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
      ...(isProd ? {} : { stack: err.stack })
    });
  });

  // 9. Socket.io Real-Time Synchronization Engine
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded;
      } catch (e) {
        // Allow guest or proceed unauthenticated
        socket.user = null;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
      if (socket.user.role) {
        socket.join(`role:${socket.user.role}`);
      }
    }

    // Join live lesson room
    socket.on('join_lesson', ({ lessonId }) => {
      socket.join(`lesson:${lessonId}`);
      io.to(`lesson:${lessonId}`).emit('user_joined_lesson', {
        userId: socket.user?.id,
        username: socket.user?.username
      });
    });

    // Leave live lesson room
    socket.on('leave_lesson', ({ lessonId }) => {
      socket.leave(`lesson:${lessonId}`);
      io.to(`lesson:${lessonId}`).emit('user_left_lesson', {
        userId: socket.user?.id,
        username: socket.user?.username
      });
    });

    // Send live reactions / questions during lesson
    socket.on('lesson_reaction', ({ lessonId, reaction }) => {
      io.to(`lesson:${lessonId}`).emit('new_reaction', {
        userId: socket.user?.id,
        username: socket.user?.username,
        reaction,
        timestamp: new Date().toISOString()
      });
    });

    // Timed Exam Sync: request remaining time
    socket.on('sync_timer', ({ assignmentId, remainingSeconds }) => {
      socket.emit('timer_updated', {
        assignmentId,
        remainingSeconds,
        serverTime: new Date().toISOString()
      });
    });

    // Broadcast announcement (teacher/admin)
    socket.on('send_announcement', ({ message, grade, examType }) => {
      if (socket.user && ['admin', 'manager', 'teacher'].includes(socket.user.role)) {
        io.emit('new_announcement', {
          sender: socket.user.username,
          message,
          grade,
          examType,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', () => {
      // Cleanup
    });
  });

  // 10. Start HTTP server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Mrs. Nashwa Abdelhalim Educational Platform Backend   `);
    console.log(` Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'production'}`);
    console.log(` Worker PID: ${process.pid} | Ready for 300+ students  `);
    console.log(`=======================================================`);
  });

  // 11. Graceful Shutdown
  const handleGracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP & Socket.io server closed.');
      try {
        db.close();
        console.log('SQLite database connection closed.');
      } catch (e) {
        console.warn('Error closing database:', e.message);
      }
      process.exit(0);
    });

    // Force exit after 10s if hung
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

  return { app, server, io };
}

module.exports = { startServer };
