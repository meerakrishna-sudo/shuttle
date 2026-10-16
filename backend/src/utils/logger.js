/**
 * Winston logger — structured JSON logging.
 *
 * Why structured logs?
 * In development: pretty, colored output you can read in the terminal.
 * In production (GCP Cloud Logging): JSON format so logs are searchable,
 * filterable, and can trigger alerts. You can search "level:error" and see
 * only errors, or "journeyId:xyz" to trace one booking end-to-end.
 */
const winston = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isProduction
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${message}${metaStr}`;
        })
      ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
