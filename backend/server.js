require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const requestLogger = require('./src/middleware/requestLogger');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

const app = express();

// Security headers (helmet sets sensible HTTP headers like X-Content-Type-Options, HSTS, etc.)
app.use(helmet());

// CORS: only allow our frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting: max 100 requests per 15 minutes per IP (prevents brute force)
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

app.use(express.json({ limit: '10kb' })); // reject bodies larger than 10kb
app.use(requestLogger);

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/routes', require('./src/routes/routes'));
app.use('/api/bus-stops', require('./src/routes/busStops'));
app.use('/api/journeys', require('./src/routes/journeys'));
app.use('/api/vehicles', require('./src/routes/vehicles'));
app.use('/api/bookings', require('./src/routes/bookings'));
app.use('/api/users', require('./src/routes/users'));

// Health check (used by Docker and GCP Cloud Run)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler (must come after all routes)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler (must be last and have 4 parameters)
app.use(errorHandler);

// Only auto-start when run directly (not when required by tests)
if (require.main === module) {
  const start = async () => {
    await connectDB();
    await connectRedis();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV || 'development' });
    });
  };

  start().catch((err) => {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  });
}

module.exports = app; // exported for tests
