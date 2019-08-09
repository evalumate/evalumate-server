import config from "config";
import "reflect-metadata"; // for TypeORM
import App from "./app";

const port: number = config.get("port");

const app = new App([], port);

(async () => {
  await app.connectDatabase();
  app.listen();
})();

export default app;
