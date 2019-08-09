import App from "./app";
import config from "config";

const port: number = config.get("port");

const app = new App([], port);
app.listen();

export default app;
