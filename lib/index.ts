import "reflect-metadata"; // for TypeORM
import config from "config";
import App from "./app";
import CaptchaController from "./controllers/captcha";

const port: number = config.get("port");

const app = new App([new CaptchaController()], port);

// Do not run the app in a test environment as the test script does this for us
if (process.env.NODE_ENV !== "test") {
  app.run();
}

export default app;
