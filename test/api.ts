import config from "config";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import axios from "axios";

const should = chai.should();
chai.use(chaiAsPromised);

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
});
