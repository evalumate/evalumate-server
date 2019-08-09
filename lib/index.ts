import config from "config";
import http from "http";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import Knex from "knex";
import knexConfig from "../knexfile";
import { Model } from "objection";

import { createLogger, logStream } from "./utils/logger";

import indexRouter from "./routes/index";
import apiRouter from "./routes/api";

let logger = createLogger(module);

// Setup database (knex & objection.js)
logger.debug("Setting up knex");
let knex = Knex(knexConfig);

// Migrate the database using knex
logger.debug("Executing knex migrations");
(async () => {
  await knex.migrate.latest();
})();

// Bind objection Models to knex
Model.knex(knex);

let app = express();

// Setup view engine
logger.debug("Setting up pug");
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

logger.debug("Overriding 'Express' logger");
app.use(morgan("combined", { stream: logStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Setup routes
logger.debug("Setting up routes");
app.use("/", indexRouter);
app.use("/api", apiRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

let port = config.get("port");
app.set("port", port);

// Create HTTP server
logger.debug("Creating HTTP server");
let server = http.createServer(app);
server.listen(port);

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      logger.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on("listening", () => {
  let addr = server.address();
  if(addr == null) {
    logger.error("HTTP Server address is null!");
    return;
  }
  let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  logger.info("EvaluMate server listening on " + bind);
});

export default server;
