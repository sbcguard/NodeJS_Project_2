import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
const logDir = 'public/logs';
// Timestamp format function
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
// Log format
const logFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});
// Function to create a DailyRotateFile transport
const createDailyRotateFileTransport = (subdir: string, level: string) => {
  return new DailyRotateFile({
    filename: path.join(`${logDir}/${subdir}`, '%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: level,
    format: format.combine(logFormat),
  });
};
// Create the logger
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp({ format: timezoned }), logFormat),
  transports: [
    createDailyRotateFileTransport('stdout', 'info'),
    createDailyRotateFileTransport('stderr', 'error'),
  ],
});

// Add console transport to log to the console as well
logger.add(
  new transports.Console({
    format: format.combine(format.colorize(), logFormat),
  })
);

export default logger;
