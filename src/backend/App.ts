import Controller from "./controllers/Controller";
import Destructable from "./interfaces/Destructable";
import { apiErrorHandler, frontendErrorHandler } from "./middlewares/errors";
import databaseConfig from "./ormconfig";
import mainRouter from "./routes";
import { createLogger, logStream } from "./utils/logger";
import webpackDevConfig from "../../webpack.dev.config.js";
import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import createError from "http-errors";
import morgan from "morgan";
import path from "path";
import { Connection, createConnection } from "typeorm";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";

let logger = createLogger(module);

class App implements Destructable {
  public app: express.Application;
  public port: number;
  public server: http.Server;

  private dbConnection: Connection;
  private apiControllers: Controller[];

  static staticFilesPath = path.join(
    __dirname,
    `../${process.env.NODE_ENV !== "production" ? "../dist/" : ""}frontend`
  );

  constructor(apiControllers: Controller[], port: number) {
    this.port = port;

    logger.info("Initializing App");

    this.app = express();
    this.app.set("port", this.port);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeApiControllers(apiControllers);
    this.initializeErrorHandling();

    // Create HTTP server
    logger.debug("Creating HTTP server");
    this.server = http.createServer(this.app);
  }

  private initializeMiddlewares() {
    logger.debug("Configuring morgan for request logging");
    this.app.use(morgan("combined", { stream: logStream }));

    logger.debug("Initializing middlewares");
    // Setup webpack-dev-middleware in development
    if (this.app.get("env") == "development") {
      this.setupWebpack();
    }
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(App.staticFilesPath));
  }

  private initializeRoutes() {
    logger.debug("Initializing routes");
    this.app.use(mainRouter);
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

  private setupWebpack() {
    const compiler = webpack({
      ...(webpackDevConfig as webpack.Configuration),
      mode: "development",
    });

    this.app.use(
      webpackDevMiddleware(compiler, {
        publicPath: webpackDevConfig.output.publicPath,
      })
    );
    this.app.use(webpackHotMiddleware(compiler));
  }

  private initializeApiControllers(apiControllers: Controller[]) {
    logger.debug("Initializing API controllers");
    this.apiControllers = apiControllers;
    apiControllers.forEach(controller => {
      this.app.use("/api", controller.router);
    });
  }

  private destructApiControllers() {
    logger.debug("Shutting down API controllers");
    return Promise.all(
      this.apiControllers.map(controller => {
        controller.shutDown();
      })
    );
  }

  private async connectToDatabase() {
    logger.debug("Connecting to database");
    this.dbConnection = await createConnection(databaseConfig);
    logger.info("Connected to database");
  }

  private async disconnectFromDatabase() {
    logger.debug("Closing database connection");
    await this.dbConnection.close();
  }

  private listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.debug("Calling Server.listen()");
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

  private close(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.debug("Calling Server.close()");
      this.server.close();

      this.server.on("error", (error: NodeJS.ErrnoException) => {
        reject(error);
      });

      this.server.on("close", () => {
        logger.info("Server closed");
        resolve();
      });
    });
  }

  public async run() {
    await this.connectToDatabase();
    await this.listen();
  }

  public async shutDown() {
    await this.close();
    await this.destructApiControllers();
    await this.disconnectFromDatabase();
  }
}

export default App;
