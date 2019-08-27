import { CaptchaFixture, MemberFixture, SessionFixture } from "./fixtures/models";
import CaptchaController from "../lib/controllers/CaptchaController";
import MemberController from "../lib/controllers/MemberController";
import SessionController from "../lib/controllers/SessionController";
import Captcha from "../lib/entities/Captcha";
import Member from "../lib/entities/Member";
import Session from "../lib/entities/Session";
import InvalidCaptchaSolutionException from "../lib/exceptions/InvalidCaptchaSolutionException";
import InvalidCaptchaTokenException from "../lib/exceptions/InvalidCaptchaTokenException";
import axios from "axios";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import delay from "delay";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

const should = chai.should();
chai.use(chaiAsPromised);

const captchaFixture = new CaptchaFixture();
const sessionFixture = new SessionFixture();
const memberFixture = new MemberFixture();

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
            result.status.should.equal(404);
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

  describe("RandomIdEntity", () => {
    describe("save() on a subclass with a small id range", () => {
      it("should fail at the latest when all ids are taken", async () => {
        // Temporarily modifying the Captcha class to use a tiny id range
        const initialRandomIdLength = Captcha["randomIdLength"];
        const initialRandomIdAlphabet = Captcha["randomIdAlphabet"];
        Captcha["randomIdLength"] = 1;
        Captcha["randomIdAlphabet"] = "ab";

        async function createCaptcha() {
          const captcha = new Captcha();
          captcha.solution = "solution";
          await captcha.save();
          return captcha;
        }

        const captcha1 = await createCaptcha();
        captcha1.id.should.be.oneOf(["a", "b"]);

        let captcha2: Captcha;
        while (!captcha2) {
          try {
            captcha2 = await createCaptcha();
            captcha2.id.should.be.oneOf(["a", "b"]).and.not.equal(captcha1.id);
          } catch (error) {}
        }
        await createCaptcha().should.be.rejected;

        await captcha1.remove();
        await captcha2.remove();

        // Restore Captcha id range
        Captcha["randomIdLength"] = initialRandomIdLength;
        Captcha["randomIdAlphabet"] = initialRandomIdAlphabet;
      });
    });
  });

  describe("Captcha", () => {
    describe("findAliveByToken", () => {
      it("should return a captcha by its token", async () => {
        const captcha = await captchaFixture.setUp();
        const captchaFromDb = await Captcha.findAliveById(captcha.id, 120);
        should.exist(captchaFromDb);
        await captchaFixture.tearDown();
      });

      it("should respect the time to live parameter", async () => {
        const captcha = await captchaFixture.setUp();
        await delay(200);
        const captchaFromDb = await Captcha.findAliveById(captcha.id, 0.1);
        should.not.exist(captchaFromDb);
      });
    });

    describe("deleteExpired", () => {
      it("should delete an expired captcha", async () => {
        const captcha = await captchaFixture.setUp();
        await delay(200);
        await Captcha.deleteExpired(0.1);
        return captcha.reload().should.be.rejectedWith(EntityNotFoundError);
      });

      it("should not delete a living captcha", async () => {
        const captcha = await captchaFixture.setUp();
        await Captcha.deleteExpired(1);
        await captcha.reload().should.not.be.rejected;
        await captchaFixture.tearDown();
      });
    });
  });

  describe("CaptchaController", () => {
    describe("createCaptcha", () => {
      it("should return a captcha object", async () => {
        const captcha = await CaptchaController.createCaptcha();
        captcha.should.be.an.instanceOf(Captcha);
        await captcha.remove();
      });
    });

    describe("mCreateCaptcha (via GET /captcha)", () => {
      it("should return a captcha", async () => {
        const reply = await axios.get("/api/captcha");
        reply.status.should.equal(200);
        reply.data.should.have
          .property("data")
          .that.has.property("captcha")
          .that.has.keys("image", "token");

        // The captcha should be in the database
        const captchaFromDb = await Captcha.findOne({ id: reply.data.data.captcha.token });
        should.exist(captchaFromDb);
        await captchaFromDb.remove();
      });
    });

    describe("validateCaptchaSolution", () => {
      it("should successfully validate a created captcha's solution", async () => {
        const captcha = await captchaFixture.setUp();
        await CaptchaController.validateCaptchaSolution(captcha.id, captcha.solution).should.not.be
          .rejected;
        await captchaFixture.tearDown();
      });

      it("should throw InvalidCaptchaSolutionException with a wrong solution", async () => {
        const captcha = await captchaFixture.setUp();
        await CaptchaController.validateCaptchaSolution(
          captcha.id,
          "my not-so-right solution"
        ).should.be.rejectedWith(InvalidCaptchaSolutionException);
        await captchaFixture.tearDown();
      });

      it("should throw InvalidCaptchaTokenException with an invalid token", async () => {
        await CaptchaController.validateCaptchaSolution(
          "an invalid token",
          "my probably right solution"
        ).should.be.rejectedWith(InvalidCaptchaTokenException);
      });
    });
  });

  describe("SessionController", () => {
    describe("createSession", () => {
      it("should return a session object", async () => {
        const session = await SessionController.createSession("My Session Name", false);
        session.should.be.an.instanceOf(Session);
        await session.remove();
      });
    });

    describe("mCreateSession (via POST /sessions)", () => {
      it("should reply with a new session", async () => {
        const captcha = await CaptchaController.createCaptcha();

        const reply = await axios.post("/api/sessions", {
          captcha: {
            token: captcha.id,
            solution: captcha.solution,
          },
          sessionName: "Another session name",
          captchaRequired: false,
        });
        reply.status.should.equal(201);
        reply.data.should.have.property("data");

        const data = reply.data.data;
        data.should.have.property("session");

        const session = data.session;
        session.should.have.keys(["uri", "id", "key"]);

        const sessionFromDb = await Session.findOne(session.id);
        should.exist(sessionFromDb);
        sessionFromDb.remove();
      });
    });

    describe("mGetSession (via GET /sessions/:sessionId)", () => {
      describe("with a valid sessionId", () => {
        it("should reply with sessionName and captchaRequired", async () => {
          const session = await sessionFixture.setUp();

          const reply = await axios.get(session.uri);
          reply.status.should.equal(200);
          reply.data.should.have.property("data");

          const replyData = reply.data.data;
          replyData.should.have.property("sessionName", session.name);
          replyData.should.have.property("captchaRequired", session.captchaRequired);

          await sessionFixture.tearDown();
        });
      });

      describe("with an invalid sessionId", () => {
        it("should reply with status 404", async () => {
          (await axios.get("/api/sessions/non-existing-session")).status.should.equal(404);
        });
      });
    });

    describe("mDeleteSession (via DELETE /sessions/:sessionId)", () => {
      describe("with invalid session key", () => {
        it("should reply with status code 403", async () => {
          const session = await sessionFixture.setUp();

          const reply = await axios.delete(session.uri + "?sessionKey=foo");
          reply.status.should.equal(403);

          await sessionFixture.tearDown();
        });
      });

      describe("with valid session key", () => {
        it("should reply with status code 200 and delete the session", async () => {
          const session = await sessionFixture.setUp();

          const reply = await axios.delete(session.uri + "?sessionKey=" + session.key);
          reply.status.should.equal(200);
          await session.reload().should.be.rejectedWith(EntityNotFoundError);

          await sessionFixture.tearDown();
        });
      });
    });

    describe("mGetSessionStatus (via GET /sessions/:sessionId/status)", () => {
      describe("with valid session key", () => {
        it("should reply with session status data", async () => {
          const session = await sessionFixture.setUp();

          const reply = await axios.get(session.uri + "/status?sessionKey=" + session.key);
          reply.status.should.equal(200);

          // TODO Add assertions on the data object (once defined in the API)

          await sessionFixture.tearDown();
        });
      });

      describe("with invalid session key", () => {
        it("should reply with status code 403", async () => {
          const session = await sessionFixture.setUp();

          const reply = await axios.get(session.uri + "/status?sessionKey=bar");
          reply.status.should.equal(403);

          await sessionFixture.tearDown();
        });
      });
    });
  });

  describe("MemberController", () => {
    describe("createMember", () => {
      it("should return a member object", async () => {
        const session = await sessionFixture.setUp();

        const member = await MemberController.createMember(session);
        member.should.be.an.instanceOf(Member);

        await sessionFixture.tearDown(); // Also deletes the member
      });
    });

    describe("mCreateMember (via POST /sessions/:sessionId/members)", () => {
      describe("when joining the session requires a captcha", () => {
        describe("and a captcha is provided", () => {
          it("should reply with a new member", async () => {
            const session = await sessionFixture.setUp(true); // Require a captcha
            const captcha = await captchaFixture.setUp();

            const reply = await axios.post(`${session.uri}/members`, {
              captcha: {
                token: captcha.id,
                solution: captcha.solution,
              },
            });
            reply.status.should.equal(201);
            reply.data.should.have.property("data");

            const data = reply.data.data;
            data.should.have.property("member");

            const member = data.member;
            member.should.have.keys(["uri", "id", "secret"]);

            await Promise.all([sessionFixture.tearDown(), captchaFixture.tearDown()]);
          });
        });

        describe("and no captcha is provided", () => {
          it("should reply with status 403", async () => {
            const session = await sessionFixture.setUp(true); // Require a captcha

            const reply = await axios.post(`${session.uri}/members`);
            reply.status.should.equal(403);

            await sessionFixture.tearDown();
          });
        });
      });

      describe("when joining the session requires no captcha", () => {
        it("should reply with a new member", async () => {
          const session = await sessionFixture.setUp(false); // Do not require a captcha

          const reply = await axios.post(`${session.uri}/members`);
          reply.status.should.equal(201);
          reply.data.should.have
            .property("data")
            .that.has.property("member")
            .that.has.property("id");

          const id = reply.data.data.member.id;
          const member = Member.findOne({ id, sessionId: session.id });
          should.exist(member);

          await sessionFixture.tearDown(); // The member is deleted with the session automatically
        });
      });
    });

    describe("mDeleteMember (via DELETE /sessions/:sessionId/members/:memberId)", () => {
      describe("with an invalid member id", () => {
        it("should reply with status 404", async () => {
          const session = await sessionFixture.setUp();

          const reply = await axios.delete(session.uri + "/members/my-invalid-member-id");
          reply.status.should.equal(404);

          await sessionFixture.tearDown();
        });
      });

      describe("with a valid member id", () => {
        describe("with no or an invalid member secret", () => {
          it("should reply with status 403", async () => {
            const member = await memberFixture.setUp();

            let reply = await axios.delete(member.uri);
            reply.status.should.equal(403);
            reply = await axios.delete(member.uri + "?memberSecret=anInvalidSecret");
            reply.status.should.equal(403);

            await memberFixture.tearDown();
          });
        });

        describe("with a valid member secret", () => {
          it("should reply with status 200", async () => {
            const member = await memberFixture.setUp();

            const reply = await axios.delete(`${member.uri}?memberSecret=${member.secret}`);
            reply.status.should.equal(200);

            await member.reload().should.be.rejectedWith(EntityNotFoundError);

            await memberFixture.tearDown();
          });
        });
      });
    });

    describe("mSetUnderstanding (via PUT /sessions/:sessionId/members/:memberId/status)", () => {
      it("should modify a member's understanding property in the database", async () => {
        const member = await memberFixture.setUp();
        const statusUri = `${member.uri}/status?memberSecret=${member.secret}`;

        let setAndAssertStatus = async (status: boolean) => {
          const reply = await axios.put(statusUri, { understanding: status });
          reply.status.should.equal(200);
          await member.reload();
          member.understanding.should.equal(status);
        };

        for (const status of [false, true, true, false]) {
          await setAndAssertStatus(status);
        }

        await memberFixture.tearDown();
      });
    });
  });
});
