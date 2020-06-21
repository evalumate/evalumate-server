import "reflect-metadata";

import config from "config";
import nodeCleanup from "node-cleanup";

import App from "./App";
import { createLogger } from "./utils/logger";

const logger = createLogger();

const app = new App(config.get("port"));

// Warn in a test environment
if (process.env.NODE_ENV == "test") {
  logger.warn("You have imported backend/index.ts in a test environment. Is this intended?");
}

app.run();

// https://www.npmjs.com/package/node-cleanup
nodeCleanup((exitCode, signal) => {
  if (signal) {
    logger.info("Received signal: %s", signal);
    app.shutDown().then(() => {
      // calling process.exit() won't inform parent process of signal
      process.kill(process.pid, signal);
    });
    nodeCleanup.uninstall(); // don't call cleanup handler again
    return false; // Do not exit
  }
});

export default app;
