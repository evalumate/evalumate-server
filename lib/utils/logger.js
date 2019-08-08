import { createLogger, format, transports } from "winston";
import config from "config";

let logger = new createLogger({
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
      colorize: false,
    }),
  ],
});

if (!["test", "production"].includes(process.env.NODE_ENV)) {
  logger.add(
    new transports.Console({
      level: "debug",
      format: format.cli(),
      handleExceptions: true,
      json: false,
    })
  );
}

export default logger;
export const logStream = {
  write: function(message, encoding) {
    logger.info(message.slice(0, -1));
  },
};
