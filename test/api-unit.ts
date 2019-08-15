import axios from "axios";
import Captcha from "../lib/entities/captcha";
import CaptchaController from "../lib/controllers/captcha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import InvalidCaptchaTokenException from "../lib/exceptions/InvalidCaptchaTokenException";
import Session from "../lib/entities/session";
import SessionController from "../lib/controllers/session";
import sleep from "await-sleep";

const should = chai.should();
chai.use(chaiAsPromised);

describe("Unit tests", () => {
  describe("HTTP", () => {
    describe("/api", () => {
      describe("/", () => {
        it("should return a valid response (API version and data object)", () => {
          return axios
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

    describe("createCaptcha", () => {
      it("should return a captcha object", () => {
        return CaptchaController.createCaptcha().should.eventually.be.an.instanceOf(
          Captcha
        );
      });
    });

    describe("validateCaptchaSolution", () => {
      it("should successfully validate a created captcha's solution", async () => {
        const captcha = await CaptchaController.createCaptcha();
        return CaptchaController.validateCaptchaSolution(
          captcha.token,
          captcha.solution
        ).should.eventually.equal(true);
      });

      it("should not successfully validate a wrong solution", async () => {
        const captcha = await CaptchaController.createCaptcha();
        return CaptchaController.validateCaptchaSolution(
          captcha.token,
          "my not-so-right solution"
        ).should.eventually.equal(false);
      });

      it("should throw InvalidCaptchaTokenException with an invalid token", async () => {
        CaptchaController.validateCaptchaSolution(
          "an invalid token",
          "my probably right solution"
        ).should.be.rejectedWith(InvalidCaptchaTokenException);
      });
    });
  });

  describe("Captcha", () => {
    describe("findAliveByToken", () => {
      it("should return a captcha by its token", async () => {
        const captcha = await CaptchaController.createCaptcha();
        return Captcha.findAliveByToken(
          captcha.token,
          120
        ).should.eventually.be.an.instanceOf(Captcha);
      });

      it("should respect the time to live parameter", async () => {
        const captcha = await CaptchaController.createCaptcha();
        await sleep(200);
        const retrievedCaptcha = await Captcha.findAliveByToken(
          captcha.token,
          0.1
        );
        should.not.exist(retrievedCaptcha);
      });
    });
  });

  describe("SessionController", () => {
    describe("Registered routes", () => {
      it("should not respond with 404", () => {
        return axios
          .post("/api/sessions")
          .should.eventually.not.have.property("status", 404);
      });
    });

    describe("createSession", () => {
      it("should return a session object", () => {
        return SessionController.createSession(
          "my session name",
          false
        ).should.eventually.be.an.instanceOf(Session);
      });
    });
  });

  describe("Session", () => {
    describe("findByPublicId", () => {
      it("should return a session by its public id", async () => {
        const session = await SessionController.createSession(
          "my session name",
          false
        );
        return Session.findOneByPublicId(
          session.publicId
        ).should.eventually.be.an.instanceOf(Session);
      });
    });
  });
});