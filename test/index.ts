import config from "config";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import axios from "axios";

let should = chai.should();
chai.use(chaiAsPromised);

import app from "../lib/index";

axios.defaults.baseURL = "http://127.0.0.1:" + config.get("port");

describe("Server", () => {
  it("GET / should return 200", async () => {
    return axios.get("/").should.eventually.have.property("status", 200);
  });
});

describe("API", () => {
  describe("/captcha", () => {
    it("GET should return captchaImage and captchaToken", async () => {
      let result = await axios.get("/captcha");
      result.should.have.property("data");
      result.data.should.have.property("data.captchaImage").that.is.a("string");
      result.data.should.have.property("data.captchaToken").that.is.a("string");
    });
  });
});

after(async () => {
  app.server.close();
});
