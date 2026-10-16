const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in environment variables');

  await mongoose.connect(uri, {
    // These options prevent deprecation warnings and set connection pool limits
    maxPoolSize: 10, // max 10 simultaneous MongoDB connections
  });

  logger.info('MongoDB connected', { host: mongoose.connection.host });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });
};

module.exports = connectDB;
