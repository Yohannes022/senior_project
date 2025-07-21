// Simple logger utility with colors for different log levels
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

// Log levels with colors
const levels = {
  info: { color: colors.cyan, label: 'INFO' },
  success: { color: colors.green, label: 'SUCCESS' },
  warning: { color: colors.yellow, label: 'WARNING' },
  error: { color: colors.red, label: 'ERROR' },
  debug: { color: colors.blue, label: 'DEBUG' },
};

/**
 * Log a message with a specific level
 * @param {string} message - The message to log
 * @param {string} [level='info'] - The log level (info, success, warning, error, debug)
 * @param {boolean} [includeTimestamp=true] - Whether to include a timestamp
 */
function log(message, level = 'info', includeTimestamp = true) {
  const logLevel = levels[level] || levels.info;
  const timestamp = includeTimestamp ? `[${new Date().toISOString()}]` : '';
  const prefix = `${logLevel.color}${logLevel.label}${colors.reset}`;
  
  // Format the message with appropriate colors and formatting
  let formattedMessage = message;
  
  // Handle error objects
  if (level === 'error' && message instanceof Error) {
    formattedMessage = `${message.message}\n${message.stack}`;
  }
  
  // Output the log message
  console.log(`${timestamp} ${prefix} ${formattedMessage}`);
}

// Add shortcut methods for each log level
Object.entries(levels).forEach(([level, { color }]) => {
  log[level] = (message, includeTimestamp = true) => {
    log(message, level, includeTimestamp);
  };
});

export { log };
