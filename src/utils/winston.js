// * Packages
const { createLogger, format, transports } = require('winston');

// * Utils
const { NODE_ENV } = require('./config');

const { combine, timestamp, printf, colorize, align } = format;

// * Log format
const logFormat = combine(
  colorize(),
  timestamp(),
  align(),
  printf((info) => {
    const user_id = info.user_id ? ` 👤 ${info.user_id} ~ ` : '';
    if (info.err) {
      try {
        const stackTrace = info.err.stack.split('\n').slice(0, 2).join(' ');
        return `${info.timestamp} ${info.level}:${user_id}${info.message} \t Traceback: ${stackTrace}`.trim();
      } catch (err) {
        return `${info.timestamp} ${info.level}:${user_id}${info.message} ${info.err}`.trim();
      }
    }
    return `${info.timestamp} ${info.level}:${user_id}${info.message}`.trim();
  })
);

// * Logger initialization
const logger = new createLogger({
  transports: [
    new transports.Console({
      level: NODE_ENV === 'production' ? 'info' : 'debug',
      handleExceptions: true,
      format: logFormat,
    }),
  ],
  exitOnError: false,
});
logger.stream = {
  write(message) {
    logger.info(message);
  },
};

module.exports = logger;
