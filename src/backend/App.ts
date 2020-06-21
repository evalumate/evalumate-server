import http from "http";
import path from "path";

import express from "express";
import createError from "http-errors";
import nextJs from "next";
import { Connection, createConnection } from "typeorm";

import CaptchaController from "./controllers/CaptchaController";
import Controller from "./controllers/Controller";
import MemberController from "./controllers/MemberController";
import RecordController from "./controllers/RecordController";
import SessionController from "./controllers/SessionController";
import Destructable from "./interfaces/Destructable";
import { apiErrorHandler, frontendErrorHandler } from "./middlewares/errors";
import databaseConfig from "./ormconfig";
import { success as apiRespondSuccess } from "./utils/api-respond";
import { createLogger } from "./utils/logger";

const env = process.env.NODE_ENV!;
const dev = env !== "production";

const logger = createLogger(module);

class App implements Destructable {
  public app: express.Application;
  public port: number | null;
  public server?: http.Server;

  /**
   * Next.js server instance
   */
  static nextJsServer = nextJs({
    dev,
    dir: path.join(__dirname, `../${!dev ? "../src/" : ""}frontend`),
  });

  private runNextJsServer: boolean;

  private dbConnection: Connection;
  private apiControllers: Controller[];

  /**
   * Constructs a new App instance.
   *
   * @param port The port for the http server to listen on. If it is not specified (like for testing
   *             purposes), no http server is created. In this case,
   * @param runNextJsServer Whether or not to serve requests using next.js
   */
  constructor(port: number | null = null, runNextJsServer: boolean = true) {
    logger.info("Initializing App");
    this.port = port;
    this.runNextJsServer = runNextJsServer;

    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeApiControllers();
    this.initializeErrorHandling();

    if (runNextJsServer) {
      this.initializeNextJsRequestHandling();
    }

    if (this.port) {
      // Create HTTP server
      this.app.set("port", this.port);
      logger.debug("Creating HTTP server");
      this.server = http.createServer(this.app);
    }
  }

  private initializeMiddlewares() {
    // logger.debug("Configuring morgan for request logging");
    // this.app.use(morgan("combined", { stream: logStream }));

    logger.debug("Initializing middlewares");
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private initializeRoutes() {
    logger.debug("Initializing routes");

    /* Root API route */
    this.app.get("/api", function (req, res, next) {
      apiRespondSuccess(res);
    });
  }

  private initializeApiControllers() {
    logger.debug("Initializing API controllers");
    this.apiControllers = [
      new CaptchaController(),
      new SessionController(),
      new MemberController(),
      new RecordController(),
    ];
    this.apiControllers.forEach((controller) => {
      this.app.use("/api", controller.router);
    });
  }

  private initializeErrorHandling() {
    // Create Error 404 if no previously added middleware has responded to an API route
    this.app.use("/api", (req, res, next) => {
      next(createError(404));
    });

    // Error middlewares
    this.app.use("/api", apiErrorHandler);

    if (this.runNextJsServer) {
      this.app.use(frontendErrorHandler);
    }
  }

  private initializeNextJsRequestHandling() {
    // Render page with Next.js
    const requestHandler = App.nextJsServer.getRequestHandler();
    this.app.use((req, res) => requestHandler(req, res));
  }

  private async destructApiControllers() {
    logger.debug("Shutting down API controllers");
    await Promise.all(this.apiControllers.map((controller) => controller.shutDown()));
    logger.debug("API controllers shut down");
  }

  private async prepareNextJsServer() {
    logger.debug("Preparing Next.js server");
    await App.nextJsServer.prepare();
    logger.debug("Next.js server is ready");
  }

  private async connectToDatabase() {
    logger.debug("Connecting to database");
    this.dbConnection = await createConnection(databaseConfig);
    logger.info("Connected to database");
  }

  private async disconnectFromDatabase() {
    logger.debug("Closing database connection");
    await this.dbConnection.close();
    logger.debug("Database connection closed");
  }

  public getDatabaseConnection() {
    return this.dbConnection;
  }

  /**
   * Makes `this.server` listen.
   *
   * Note: This can only work if `this.server` is not null and should not be called otherwise.
   */
  private listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof this.server !== "undefined") {
        logger.debug("Calling Server.listen()");
        this.server.listen(this.port);

        this.server.on("error", (error: NodeJS.ErrnoException) => {
          if (error.syscall !== "listen") {
            reject(error);
          }

          // handle specific listen errors with friendly messages
          switch (error.code) {
            case "EACCES":
              logger.error(`Port ${this.port} requires elevated privileges.`);
              process.exit(1);
              break;
            case "EADDRINUSE":
              logger.error(`Port ${this.port} is already in use.`);
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
      } else {
        reject(new Error("this.server is undefined!"));
      }
    });
  }

  private close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof this.server !== "undefined") {
        logger.debug("Calling Server.close()");
        this.server.close();

        this.server.on("error", (error: NodeJS.ErrnoException) => {
          reject(error);
        });

        this.server.on("close", () => {
          logger.info("Server closed");
          resolve();
        });
      } else {
        reject(new Error("this.server is undefined!"));
      }
    });
  }

  public async run() {
    if (this.runNextJsServer) {
      await this.prepareNextJsServer();
    }
    await this.connectToDatabase();
    if (typeof this.server !== "undefined") {
      await this.listen();
    }
  }

  public async shutDown() {
    logger.info("Shutting down");
    if (typeof this.server !== "undefined") {
      await this.close();
    }
    await this.destructApiControllers();
    await this.disconnectFromDatabase();
  }
}

export default App;
