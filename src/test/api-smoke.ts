import axios from "axios";
import Captcha from "../backend/entities/Captcha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import config from "config";
import { step } from "mocha-steps";

const should = chai.should();
chai.use(chaiAsPromised);

// Variables to store captcha details for session creation
let captchaToken: string, captchaSolution: string;

// Variable to store post parameters for session creation
let sessionPostParameters: any;

// Variables to store session details for later use
let sessionId: string, sessionKey: string, sessionUri: string;

describe("Smoke test", () => {
  describe("/api", () => {
    describe("/captcha", () => {
      describe("GET", () => {
        step("should return a captcha object (image and token)", async () => {
          const reply = await axios.get("/api/captcha");
          reply.should.have.property("status", 200);
          reply.data.should.have.property("data").that.has.property("captcha");
          captchaToken = reply.data.data.captcha.token;
        });

        describe("The captcha token", () => {
          step("should have an entry in the database", async () => {
            const captcha = await Captcha.findOne({ id: captchaToken });
            should.exist(captcha);
            captchaSolution = captcha!.solution;
          });
        });
      });
    });

    describe("/sessions", () => {
      describe("GET", () => {
        step("should return error 404 (express doesn't support 405 unfortunately)", () => {
          return axios.get("/api/sessions").should.eventually.have.property("status", 404);
        });
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

            const reply = await axios.post("/api/sessions", sessionPostParameters);

            const session = reply.data.data.session;
            sessionUri = session.uri;
            sessionId = session.id;
            sessionKey = session.key;
          });

          describe("A GET request to the returned session uri", () => {
            it("should return sessionName and captchaRequired", async () => {
              const reply = await axios.get(sessionUri);
              reply.should.have.property("status", 200);
              const data = reply.data.data;
              data.should.have.property("sessionName", sessionPostParameters.sessionName);
              data.should.have.property("captchaRequired", sessionPostParameters.captchaRequired);
            });
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
});
