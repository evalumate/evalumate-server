import config from "config";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import axios from "axios";
import app from "../server/index";

const should = chai.should();
chai.use(chaiAsPromised);

axios.defaults.baseURL = "http://127.0.0.1:" + config.get("port");

before(() => {
  return app.run();
});

after(() => {
  return app.shutDown();
});
