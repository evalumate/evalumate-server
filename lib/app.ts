import * as express from "express";
import { createConnection } from "typeorm";
import http from "http";
import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createLogger, logStream } from "./utils/logger";

import Controller from "./interfaces/controller";
import { frontendErrorHandler, apiErrorHandler } from "./middlewares/errors";
import databaseConfig from "./ormconfig";

let logger = createLogger(module);

class App {
  public app: express.Application;
  public port: number;
  public server: http.Server;
  public up: Promise<boolean>;

  constructor(apiControllers: Controller[], port: number) {
    this.port = port;

    logger.info("Initializing App");

    this.app = express.default();
    this.app.set("port", this.port);

    this.setupViewEngine();
    this.initializeMiddlewares();
    this.initializeApiControllers(apiControllers);
    this.initializeErrorHandling();

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

    // Temporary solution until a frontend is added
    // TODO add frontend
    this.app.get("/", (req, res, next) => {
      res.render("index", { title: "EvaluMate" });
    });
  }

  private initializeErrorHandling() {
    // Create Error 404 if no previously added middleware has responded
    this.app.use((req, res, next) => {
      next(createError(404));
    });

    // Error middlewares
    this.app.use("/api", apiErrorHandler);
    this.app.use(frontendErrorHandler);
  }

  private setupViewEngine() {
    logger.debug("Setting up pug");
    this.app.set("views", path.join(__dirname, "../views"));
    this.app.set("view engine", "pug");
  }

  private initializeApiControllers(apiControllers: Controller[]) {
    logger.debug("Initializing controllers");
    apiControllers.forEach(controller => {
      this.app.use("/api", controller.router);
    });
  }

  private async connectToDatabase() {
    logger.debug("Connecting to database");
    await createConnection(databaseConfig);
    logger.info("Connected to database");
  }

  private listen(): Promise<undefined> {
    return new Promise((resolve, reject) => {
      logger.debug("Calling Server.listen");
      this.server.listen(this.port);

      this.server.on("error", (error: NodeJS.ErrnoException) => {
        if (error.syscall !== "listen") {
          reject(error);
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
            reject(error);
        }
      });

      this.server.on("listening", () => {
        logger.info("EvaluMate server listening on port " + this.port);
        resolve();
      });
    });
  }

  public async run() {
    await this.connectToDatabase();
    await this.listen();
  }
}

export default App;
