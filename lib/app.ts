import * as express from "express";
import { createConnection } from "typeorm";
import http from "http";
import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createLogger, logStream } from "./utils/logger";

import Controller from "./interfaces/controller";
import errorMiddleware from "./middlewares/error";
import databaseConfig from "./ormconfig";

let logger = createLogger(module);

class App {
  public app: express.Application;
  public port: number;
  public server: http.Server;

  constructor(controllers: Controller[], port: number) {
    this.port = port;

    logger.info("Initializing App");

    this.app = express.default();
    this.app.set("port", this.port);

    this.setupViewEngine();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);

    // Create HTTP server
    logger.debug("Creating HTTP server");
    this.server = http.createServer(this.app);
  }

  private initializeMiddlewares() {
    logger.debug("Initializing middlewares");
    logger.debug("Configuring morgan for request logging");
    this.app.use(morgan("combined", { stream: logStream }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, "../public")));

    // Catch 404 and forward to error handler
    this.app.use((req, res, next) => {
      next(createError(404));
    });

    // Error middleware
    this.app.use(errorMiddleware);
  }

  public async connectDatabase() {
    logger.debug("Connecting to database");
    await createConnection(databaseConfig);
    logger.info("Connected to database");
  }

  private setupViewEngine() {
    logger.debug("Setting up pug");
    this.app.set("views", path.join(__dirname, "../views"));
    this.app.set("view engine", "pug");
  }

  private initializeControllers(controllers: Controller[]) {
    logger.debug("Initializing controllers");
    controllers.forEach(controller => {
      this.app.use("/", controller.router);
    });
  }

  public listen() {
    logger.debug("Calling server.listen");
    this.server.listen(this.port);

    this.server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      let portString = "Port " + this.port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case "EACCES":
          logger.error(portString + " requires elevated privileges");
          process.exit(1);
          break;
        case "EADDRINUSE":
          logger.error(portString + " is already in use");
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    this.server.on("listening", () => {
      logger.info("EvaluMate server listening on port " + this.port);
    });
  }
}

export default App;
