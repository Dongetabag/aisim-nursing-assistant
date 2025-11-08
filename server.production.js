const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const chartingRoutes = require('./routes/charting');
const automationRoutes = require('./routes/automation');
const geminiService = require('./services/geminiService');

const { logger, httpLogger, auditLog } = require('./middleware/logger');
const {
  apiLimiter,
  sanitizeInput,
  getCorsOptions,
  helmetConfig,
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (important for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Security headers
app.use(helmet(helmetConfig));

// CORS configuration
app.use(cors(getCorsOptions()));

// Compression middleware for better performance
app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// HTTP request logging
app.use(httpLogger);

// Body parsing middleware with size limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Input sanitization
app.use(sanitizeInput);

// Static files with caching
app.use(express.static(path.join(__dirname, 'frontend'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Cache static assets aggressively
    if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    } else if (filePath.endsWith('.woff2') || filePath.endsWith('.woff')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
  },
}));

// API rate limiting
app.use('/api', apiLimiter);

// API routes
app.use('/api/charting', chartingRoutes);
app.use('/api/automation', automationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    service: 'AISim Nursing Assistant',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      limit: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  };

  res.json(healthCheck);
  logger.debug('Health check performed');
});

// Metrics endpoint (for monitoring)
app.get('/api/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    platform: process.platform,
    nodeVersion: process.version,
  };

  res.json(metrics);
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Audit log endpoint (protected - should add auth in production)
app.post('/api/audit-log', (req, res) => {
  const { action, details } = req.body;
  auditLog(action, req.ip, { ...details, ip: req.ip });
  res.json({ success: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}\nStack: ${err.stack}`);

  // Don't leak error details in production
  const errorResponse = {
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  };

  // Log error for audit trail
  auditLog('error', req.ip, {
    error: err.message,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(err.status || 500).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl} - ${req.ip}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');

    // Close database connections, etc.
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}\nStack: ${err.stack}`);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}\nReason: ${reason}`);
});

// Initialize Gemini service
geminiService.initialize();

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  logger.info('Created logs directory');
}

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🏥 AISim Nursing Assistant running on port ${PORT}`);
  logger.info(`📋 Visit http://localhost:${PORT} to access the application`);
  logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Security: Helmet, CORS, Rate Limiting, Input Sanitization enabled`);
  logger.info(`⚡ Performance: Compression, Caching enabled`);
  logger.info(`📊 Logging: Winston logger initialized`);
});

module.exports = app;
