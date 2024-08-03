import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
const logDir = 'public/logs';
// Custom timestamp format function
const timezoned = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false, // 24-hour time format
  });
};
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: timezoned }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'stdout-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      format: format.combine(
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
      ),
    }),
    new DailyRotateFile({
      filename: path.join(logDir, 'stderr-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: format.combine(
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
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
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      })
    ),
  })
);

export default logger;
