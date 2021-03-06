import path from "path";

import config from "config";
import {
  Logger,
  LoggerOptions,
  createLogger as createWinstonLogger,
  format,
  transports,
} from "winston";

const options: LoggerOptions = {
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "evalumate" },
  transports: [
    new transports.File({
      level: config.get("logging.level"),
      filename: config.get("logging.directory") + "/app.log",
      handleExceptions: config.get("logging.handleExceptions"),
      maxsize: 5242880, //5MB
      maxFiles: 5,
    }),
  ],
};
const logger: Logger = createWinstonLogger(options);

const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

if (!["test", "production"].includes(nodeEnv)) {
  logger.add(
    new transports.Console({
      level: config.get("logging.level"),
      format: format.cli(),
      handleExceptions: true,
    })
  );
}

const rootModulePath = path.resolve(module.id, "../../");

// Add module id to log messages
export function createLogger(module?: NodeModule) {
  if (typeof module === "undefined") {
    return logger;
  }
  const filenamePrefix = path.relative(rootModulePath, module.id) + ": ";
  return {
    debug: function (msg: string, meta?: any) {
      logger.debug(filenamePrefix + msg, meta);
    },
    info: function (msg: string, meta?: any) {
      logger.info(filenamePrefix + msg, meta);
    },
    warn: function (msg: string, meta?: any) {
      logger.warn(filenamePrefix + msg, meta);
    },
    error: function (msg: string, meta?: any) {
      logger.error(filenamePrefix + msg, meta);
    },
  };
}

// For use by morgan
export const logStream = {
  write: function (message: string) {
    logger.info(message.slice(0, -1));
  },
};
