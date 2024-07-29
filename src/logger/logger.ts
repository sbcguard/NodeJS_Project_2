import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = 'public/logs';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'stdout-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      format: format.combine(
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
    new DailyRotateFile({
      filename: path.join(logDir, 'stderr-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: format.combine(
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
  ],
});

// Add console transport to log to the console as well
logger.add(
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
  })
);

export default logger;
