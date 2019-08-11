import axios from "axios";
import Captcha from "../lib/entities/captcha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import config from "config";
import { step } from "mocha-steps";

const should = chai.should();
chai.use(chaiAsPromised);

axios.defaults.validateStatus = (status: number) => {
  return true; // Do not throw errors on HTTP error statuses
};

// Variables to store captcha details for later session creation
let captchaToken: string, captchaSolution: string;

// Variable to store post parameters for session creation
let sessionPostParameters: any;

// Variables to store session details for later use
let sessionId: string, sessionKey: string, sessionUri: string;

describe("/api", () => {
  describe("GET", () => {
    step("should return a valid response (API version and data object)", () => {
      axios
        .get("/api")
        .should.eventually.have.property("data")
        .that.has.keys(["apiVersion", "data"]);
    });
  });

  describe("/non-existing/resource", () => {
    describe("GET", () => {
      step("should return a proper error", async () => {
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

  describe("/captcha", () => {
    describe("GET", () => {
      step(
        "should return a proper captcha object (image and token)",
        async () => {
          const reply = await axios.get("/api/captcha");
          reply.should.have.property("status", 200);
          reply.data.should.have.property("data");

          const data = reply.data.data;
          data.should.have.property("captcha").that.has.keys("image", "token");

          captchaToken = data.captcha.token;
        }
      );

      describe("The captcha token", () => {
        step("should have an entry in the database", async () => {
          const captcha = await Captcha.findOne({ token: captchaToken });
          should.exist(captcha);
          captchaSolution = captcha.solution;
        });
      });
    });
  });

  describe("/sessions", () => {
    describe("GET", () => {
      step(
        "should return error 404 (express doesn't support 405 unfortunately)",
        () => {
          return axios
            .get("/api/sessions")
            .should.eventually.have.property("status", 404);
        }
      );
    });

    describe("POST", () => {
      describe("with valid parameters", () => {
        step("should return a session object (uri, id, key)", async () => {
          // Define POST parameters
          sessionPostParameters = {
            captcha: {
              token: captchaToken,
              solution: captchaSolution,
            },
            sessionName: "My fancy session name",
            captchaRequired: false,
          };

          const reply = await axios.post(
            "/api/sessions",
            sessionPostParameters
          );
          reply.should.have.property("status", 201);
          reply.data.should.have.property("data");

          const data = reply.data.data;
          data.should.have.property("session");

          const session = data.session;
          session.should.have.keys(["uri", "id", "key"]);

          sessionUri = session.uri;
          sessionId = session.id;
          sessionKey = session.key;
        });

        describe("The returned session uri", () => {
          // TODO test session URI
        });
      });

      describe("with a duplicate captcha token", () => {
        step("should return 403 (forbidden)", () => {
          return axios
            .post("/api/sessions", sessionPostParameters)
            .should.eventually.have.property("status", 403);
        });
      });
    });
  });
});
