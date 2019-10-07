import config from "config";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import axios from "axios";
import app from "../backend/index";

const should = chai.should();
chai.use(chaiAsPromised);

axios.defaults.baseURL = "http://127.0.0.1:" + config.get("port");

axios.defaults.validateStatus = (status: number) => {
  return true; // Do not throw errors on HTTP error statuses
};

before(() => {
  return app.run();
});

after(() => {
  return app.shutDown();
});