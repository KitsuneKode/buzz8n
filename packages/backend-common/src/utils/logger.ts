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

  // Access the SPLAT symbol for additional arguments
  const splatArgs = (info[SPLAT as any] || []) as any[]
  let additionalData = ''

  if (splatArgs.length > 0) {
    additionalData = splatArgs
      .map((arg) => {
        if (typeof arg === 'object') {
          return `\n  ${JSON.stringify(arg, null, 2)}`
        }
        return ` ${arg}`
      })
      .join('')
  }

  // Also handle metadata passed as second argument (non-splat style)
  const {
    timestamp: _ts,
    level: _lvl,
    message: _msg,
    service: _svc,
    stack: _stack,
    [SPLAT]: _splat,
    ...meta
  } = info
  const metaData = Object.keys(meta).length > 0 ? `\n  meta: ${JSON.stringify(meta, null, 2)}` : ''

  return `([${colorizer(info.level, ts)}]) [${lvl}] [${info.service}] ${msg}${additionalData}${metaData}${stack}`
})

function formatTimestamp(timestamp: string) {
  const date = parseISO(timestamp)
  return dateFormat(date, 'yyyy-MM-dd HH:mm:ss.SSS a') // Changed hh to HH for 24-hour format
}

/**
 * Create a new logger instance tagged with `serviceName`
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

export const backendLogger = createLogger('buzz8n-server')
export const workerLogger = createLogger('buzz8n-worker')
