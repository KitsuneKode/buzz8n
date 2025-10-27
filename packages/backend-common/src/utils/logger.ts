import { createLogger as winstonCreateLogger, format, transports } from 'winston'
import { format as dateFormat, parseISO } from 'date-fns'
import { SPLAT } from 'triple-beam'
import path from 'path'

const { combine, errors, timestamp, printf, colorize } = format
const colorizer = colorize({
  all: true,
  colors: {
    info: 'cyan',
    log: 'magenta',
    error: 'red',
    warn: 'yellow',
    debug: 'green',
    verbose: 'blue',
    silly: 'white',
  },
}).colorize

const baseFormat = printf((info) => {
  const ts = formatTimestamp(info.timestamp as string)
  const lvl = info.level
  const msg = info.message

  // Access error stack
  const stack = info.stack ? `\n  error: ${info.stack}` : ''

  // Handle additional data - prioritize SPLAT args over metadata to avoid duplication
  const splatArgs = (info[SPLAT as any] || []) as any[]
  let additionalData = ''

  if (splatArgs.length > 0) {
    // If we have SPLAT args, use those and ignore metadata to avoid duplication
    additionalData = splatArgs
      .map((arg) => {
        if (typeof arg === 'object' && arg !== null) {
          // Compact object representation for better readability
          return ` ${JSON.stringify(arg)}`
        }
        return ` ${arg}`
      })
      .join('')
  } else {
    // Only use metadata if no SPLAT args to avoid duplication
    const {
      timestamp: _ts,
      level: _lvl,
      message: _msg,
      service: _svc,
      stack: _stack,
      [SPLAT]: _splat,
      ...meta
    } = info

    if (Object.keys(meta).length > 0) {
      additionalData = ` ${JSON.stringify(meta)}`
    }
  }

  return `[${colorizer(info.level, ts)}] [${lvl}] [${info.service}] ${msg}${additionalData}${stack}`
})

/**
 * Format an ISO 8601 timestamp string into a human-readable timestamp.
 *
 * @param timestamp - An ISO 8601 timestamp string (e.g., "2025-10-20T14:23:30.123Z")
 * @returns The formatted timestamp as `yyyy-MM-dd HH:mm:ss.SSS a` using 24-hour hour notation
 */
function formatTimestamp(timestamp: string) {
  const date = parseISO(timestamp)
  return dateFormat(date, 'yyyy-MM-dd HH:mm:ss.SSS a') // Changed hh to HH for 24-hour format
}

/**
 * Create a Winston logger configured for a specific service.
 *
 * @param serviceName - Service identifier added to each log entry as default metadata (`service`)
 * @returns A Winston logger instance that tags logs with the provided service name
 */
export function createLogger(serviceName: string) {
  const logger = winstonCreateLogger({
    level: process.env.LOG_LEVEL || 'debug', // Set log level (debug shows everything)
    defaultMeta: { service: serviceName },
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), // Changed hh to HH
      errors({ stack: true }),
      baseFormat, // Removed splat() and align() - handle manually
    ),
    transports: [
      new transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
      }),
      new transports.File({
        filename: path.join('logs', 'server.log'),
      }),
    ],
  })

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console())
  }

  return logger
}

// Example usage of the logger
//
// const payload = {
//   name: "John Doe",
//   age: 30,
//   email: "cA5Q8@example.com",
// };
//
// logger.info("Info message", { payload });
// logger.error("Error message", new Error("This is an error"));
// logger.warn("Warning message");
// logger.info("Testing the colorization");
// logger.info("Hello there. How are you?");
//
// logger.info("Logger initialized", { payload });
//
// Note: Objects are logged compactly in one line to avoid duplication and excessive verbosity

export const backendLogger = createLogger('buzz8n-server')
export const workerLogger = createLogger('buzz8n-worker')
export const wsServerLogger = createLogger('buzz8n-ws-server')
