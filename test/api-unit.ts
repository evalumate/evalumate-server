import axios from "axios";
import Captcha from "../lib/entities/captcha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const should = chai.should();
chai.use(chaiAsPromised);

describe("Unit tests", () => {
  describe("HTTP", () => {
    describe("/api", () => {
      describe("/", () => {
        it("should return a valid response (API version and data object)", () => {
          axios
            .get("/api")
            .should.eventually.have.property("data")
            .that.has.keys(["apiVersion", "data"]);
        });
      });

      describe("/non-existing/resource", () => {
        describe("GET", () => {
          it("should return 404 and have a proper error format", async () => {
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
    });
  });

  describe("CaptchaController", () => {
    describe("Registered routes", () => {
      it("should not respond with 404", () => {
        return axios
          .get("/api/captcha")
          .should.eventually.not.have.property("status", 404);
      });
    });
  });
});
