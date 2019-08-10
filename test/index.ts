import config from "config";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import axios from "axios";
import app from "../lib/index";

const should = chai.should();
chai.use(chaiAsPromised);

axios.defaults.baseURL = "http://127.0.0.1:" + config.get("port");

before(() => {
  return app.run();
});

describe("/", () => {
  it("GET should return 200", async () => {
    return axios.get("/").should.eventually.have.property("status", 200);
  });
});

after(() => {
  return app.server.close();
});
