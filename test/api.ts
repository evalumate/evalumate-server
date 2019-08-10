import config from "config";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import axios from "axios";

const should = chai.should();
chai.use(chaiAsPromised);

axios.defaults.validateStatus = (status: number) => {
  return true; // Do not throw errors on error statuses
};

describe("/api", () => {
  describe("/captcha", () => {
    it("GET should return captchaImage and captchaToken", async () => {
      const result = await axios.get("/api/captcha");
      result.should.have.property("status", 200);
      result.data.should.have.property("data");
      const data = result.data.data;
      data.should.have.property("captchaImage").that.is.a("string");
      data.should.have.property("captchaToken").that.is.a("string");
    });
  });

  describe("/non-existing/resource", () => {
    it("GET should return a proper error", async () => {
      const result = await axios.get("/api/non-existing/resource");
      result.should.have.property("status", 404);
      result.data.should.have.property("error");
      const error = result.data.error;
      error.should.have.property("code", 404);
      error.should.have.property("message").that.is.a("string");
      error.should.have.property("name").that.is.a("string");
    });
  });
});
