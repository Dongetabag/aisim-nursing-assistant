const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { body, validationResult } = require('express-validator');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for chart generation (AI API calls)
const chartGenerationLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 requests per minute
  'Chart generation rate limit exceeded. Please wait before generating another chart.'
);

// Auth rate limiter (for future authentication endpoints)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later.'
);

// Input sanitization middleware
const sanitizeInput = [
  mongoSanitize({
    replaceWith: '_',
  }),
  hpp(), // Prevent HTTP Parameter Pollution
];

// Validation middleware for chart generation
const validateChartInput = [
  body('nurseInput.patientInfo.name')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ max: 100 })
    .withMessage('Patient name must not exceed 100 characters')
    .escape(),

  body('nurseInput.patientInfo.age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),

  body('nurseInput.assessment.chiefComplaint')
    .trim()
    .notEmpty()
    .withMessage('Chief complaint is required')
    .isLength({ max: 1000 })
    .withMessage('Chief complaint must not exceed 1000 characters'),

  body('nurseInput.chartType')
    .isIn(['admission', 'assessment', 'shift', 'incident', 'discharge'])
    .withMessage('Invalid chart type'),

  // Custom validator to check for malicious content
  body('*').customSanitizer((value) => {
    if (typeof value === 'string') {
      // Remove potential XSS patterns
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    return value;
  }),
];

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// CORS configuration for production
const getCorsOptions = () => {
  const whitelist = process.env.CORS_WHITELIST
    ? process.env.CORS_WHITELIST.split(',')
    : ['http://localhost:3000', 'http://localhost:8081'];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };
};

// Security headers configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
};

module.exports = {
  apiLimiter,
  chartGenerationLimiter,
  authLimiter,
  sanitizeInput,
  validateChartInput,
  handleValidationErrors,
  getCorsOptions,
  helmetConfig,
};
