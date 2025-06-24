const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

// Define a custom log format
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    colorize(),
    customFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" })
  ]
});

module.exports = logger;
