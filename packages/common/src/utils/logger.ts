import { createLogger as winstonCreateLogger, format, transports } from 'winston'
import { format as dateFormat, parseISO } from 'date-fns'
import path from 'path'

const { splat, combine, errors, timestamp, printf, align, colorize } = format
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
    default: 'purple',
    http: 'indigo',
    help: 'orange',
  },
}).colorize

const baseFormat = printf((info) => {
  const ts = formatTimestamp(info.timestamp as string)
  const lvl = info.level
  const msg = info.message
  const stack = info.stack ? `, error: ${info.stack}` : ''
  const payload = info.payload ? `, payload: ${JSON.stringify(info.payload, null, 2)}` : ''
  return `([${colorizer(info.level, ts)}]) [${lvl}] [${info.service}] ${msg}${stack}${payload}`
})

function formatTimestamp(timestamp: string) {
  const date = parseISO(timestamp)
  return dateFormat(date, 'yyyy-MM-dd HH:mm:ss.SSS')
}

/**
 * Create a new logger instance tagged with `serviceName`
 */
function createLogger(serviceName: string) {
  const logger = winstonCreateLogger({
    defaultMeta: { service: serviceName },
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      errors({ stack: true }),
      align(),
      splat(),
      baseFormat,
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

const clientTag = '[buzz8n-client]'

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface LoggerType {
  error: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

function formatMessage(level: LogLevel, ...args: unknown[]) {
  const timestamp = new Date().toISOString()
  const colorMap: Record<LogLevel, string> = {
    error: 'color: red;',
    warn: 'color: orange;',
    info: 'color: cyan;',
    debug: 'color: gray;',
  }

  // Add color to the level + timestamp in browser console
  const header = `%c${clientTag} [${level.toUpperCase()}] [${timestamp}]`
  const style = colorMap[level]

  // Browser consoles support formatting like console.log("%cHello", "color: red")
  return [header, style, ...args]
}

const LoggerInstance: LoggerType = {
  error: (...args) => console.error(...formatMessage('error', ...args)),
  warn: (...args) => console.warn(...formatMessage('warn', ...args)),
  info: (...args) => console.info(...formatMessage('info', ...args)),
  debug: (...args) => console.debug(...formatMessage('debug', ...args)),
}

export const clientLogger = LoggerInstance
export const backendLogger = createLogger('buzz8n-server')
export const workerLogger = createLogger('buzz8n-worker')

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
