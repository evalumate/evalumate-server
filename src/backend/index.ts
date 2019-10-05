import App from "./App";
import CaptchaController from "./controllers/CaptchaController";
import MemberController from "./controllers/MemberController";
import SessionController from "./controllers/SessionController";
import { createLogger } from "./utils/logger";
import config from "config";
import nodeCleanup from "node-cleanup";
import "reflect-metadata";

const logger = createLogger();
const port: number = config.get("port");

const app = new App(
  [new CaptchaController(), new SessionController(), new MemberController()],
  port
);

// Do not run the app in a test environment as the test script does this for us
if (process.env.NODE_ENV !== "test") {
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
}

export default app;
