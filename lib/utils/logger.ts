import { createLogger as createWinstonLogger, Logger, LoggerOptions, format, transports } from "winston";
import config from "config";

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
      level: config.get("logLevel"),
      filename: config.get("logDir") + "/app.log",
      handleExceptions: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
    }),
  ],
};

const logger: Logger = createWinstonLogger(options);

if (typeof(process.env.NODE_ENV) === "undefined") {
  process.env.NODE_ENV = "development";
}

if (!["test", "production"].includes(process.env.NODE_ENV)) {
  logger.add(
    new transports.Console({
      level: "debug",
      format: format.cli(),
      handleExceptions: true,
    })
  );
}

// Add module id to log messages
export function createLogger(module: NodeModule) {
  var filename = module.id;
  return {
    debug : function (msg: string, meta?: any) {
      logger.debug(filename + ': ' + msg, meta); 
    },
    info : function (msg: string, meta?: any) {
      logger.info(filename + ': ' + msg, meta); 
    },
    warn : function (msg: string, meta?: any) {
      logger.warn(filename + ': ' + msg, meta); 
    },
    error : function (msg: string, meta?: any) {
      logger.error(filename + ': ' + msg, meta); 
    }
  }
};

// For use by morgan
export const logStream = {
  write: function(message: string) {
    logger.info(message.slice(0, -1));
  },
};
