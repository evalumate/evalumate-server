import { setupRandomSession } from "../__fixtures__/entities";
import App from "../App";
import CaptchaController from "../controllers/CaptchaController";
import MemberController from "../controllers/MemberController";
import SessionController from "../controllers/SessionController";
import Captcha from "../entities/Captcha";
import Member from "../entities/Member";
import Session from "../entities/Session";
import InvalidCaptchaSolutionException from "../exceptions/InvalidCaptchaSolutionException";
import InvalidCaptchaTokenException from "../exceptions/InvalidCaptchaTokenException";
import faker from "faker";
import pick from "lodash/pick";
import request from "supertest";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

let evalumateApp: App;
let app: Express.Application;

beforeAll(async () => {
  evalumateApp = new App(null, false);
  await evalumateApp.run();
  app = evalumateApp.app;
});

afterAll(async () => {
  await evalumateApp.shutDown();
});

describe("Api Responses", () => {
  describe("GET /api", () => {
    it("should return a valid response", async () => {
      const res = await request(app)
        .get("/api")
        .expect(200);

      expect(res.body).toEqual({
        apiVersion: expect.any(Number),
        data: expect.any(Object),
      });
    });
  });

  describe("GET /api/non-existing/resource", () => {
    it("should return 404 and have a proper error format", async () => {
      const res = await request(app)
        .get("/api/non-existing/resource")
        .expect(404);

      expect(res.body).toEqual({
        apiVersion: expect.any(Number),
        error: expect.objectContaining({
          code: 404,
          message: expect.any(String),
          name: expect.any(String),
        }),
      });
    });
  });
});

describe("CaptchaController", () => {
  describe("createCaptcha()", () => {
    it("should return a captcha object", async () => {
      const captcha = await CaptchaController.createCaptcha();

      expect(captcha).toBeInstanceOf(Captcha);
      expect(captcha.solution).toBeString();
      expect(captcha.solution.length).toBeGreaterThanOrEqual(1);

      await captcha.remove();
    });
  });

  describe("mCreateCaptcha (via GET /captcha)", () => {
    it("should return a captcha", async () => {
      const response = await request(app)
        .get("/api/captcha")
        .expect(200);

      expect(response.body.data).toEqual({
        captcha: { image: expect.any(String), token: expect.any(String) },
      });

      // The captcha should be in the database
      await expect(
        Captcha.findOne({ id: response.body.data.captcha.token })
      ).resolves.toBeInstanceOf(Captcha);
    });
  });

  describe("validateCaptchaSolution()", () => {
    describe("with a valid captcha token", () => {
      let captcha: Captcha;

      beforeEach(async () => {
        captcha = new Captcha();
        captcha.solution = faker.random.alphaNumeric(faker.random.number({ min: 4, max: 10 }));
        await captcha.save();
      });

      it("should successfully validate a valid solution", async () => {
        await expect(
          CaptchaController.validateCaptchaSolution(captcha.id, captcha.solution)
        ).resolves.toBeUndefined();

        // Captcha should have been deleted
        expect(captcha.reload()).rejects.toBeInstanceOf(EntityNotFoundError);
      });

      it("should fail with InvalidCaptchaSolutionException with a wrong solution", async () => {
        await expect(
          CaptchaController.validateCaptchaSolution(captcha.id, faker.random.alphaNumeric(3))
        ).rejects.toBeInstanceOf(InvalidCaptchaSolutionException);
      });
    });

    describe("with an invalid captcha token", () => {
      it("should throw InvalidCaptchaTokenException", async () => {
        await expect(
          CaptchaController.validateCaptchaSolution(
            faker.random.uuid(),
            faker.random.alphaNumeric(4)
          )
        ).rejects.toThrow(InvalidCaptchaTokenException);
      });
    });
  });
});

describe("SessionController", () => {
  describe("createSession()", () => {
    it("should return a session object", async () => {
      const session = await SessionController.createSession(
        faker.lorem.words(4),
        faker.random.boolean()
      );
      expect(session).toBeInstanceOf(Session);
    });
  });

  describe("mCreateSession (via POST /sessions)", () => {
    it("should reply with a new session", async () => {
      const captcha = await CaptchaController.createCaptcha();

      const sessionName = faker.lorem.words(4);
      const captchaRequired = faker.random.boolean();

      const response = await request(app)
        .post("/api/sessions")
        .send({
          captcha: {
            token: captcha.id,
            solution: captcha.solution,
          },
          sessionName,
          captchaRequired,
        })
        .expect(201);

      expect(response.body.data).toEqual({
        session: {
          uri: expect.any(String),
          id: expect.any(String),
          name: sessionName,
          key: expect.any(String),
          captchaRequired,
        },
      });

      expect(Session.findOne(response.body.data.session.id)).resolves.toBeInstanceOf(Session);
    });
  });

  describe("mGetSession (via GET /sessions/:sessionId)", () => {
    describe("with a valid sessionId", () => {
      it("should reply with sessionName and captchaRequired", async () => {
        const session = await setupRandomSession();

        const response = await request(app)
          .get(`/api${session.uri!}`)
          .expect(200);

        expect(response.body.data).toEqual({
          session: pick(session, ["id", "name", "uri", "captchaRequired"]),
        });
      });
    });

    describe("with an invalid sessionId", () => {
      it("should reply with status 404", () => {
        return request(app)
          .get(`/api/sessions/${faker.random.uuid()}`)
          .expect(404);
      });
    });
  });

  describe("mDeleteSession (via DELETE /sessions/:sessionId)", () => {
    describe("with an invalid session key", () => {
      it("should reply with status code 403", async () => {
        const session = await setupRandomSession();

        await request(app)
          .delete(`/api${session.uri}?sessionKey=${faker.random.uuid()}`)
          .expect(403);
      });
    });

    describe("with a valid session key", () => {
      it("should reply with status code 200 and delete the session", async () => {
        const session = await setupRandomSession();

        await request(app)
          .delete(`/api${session.uri}?sessionKey=${session.key}`)
          .expect(200);
        await expect(session.reload()).rejects.toBeInstanceOf(EntityNotFoundError);
      });
    });
  });

  describe("mGetSessionStatus (via GET /sessions/:sessionId/status)", () => {
    describe("with a valid session key", () => {
      it("should reply with session status data", async () => {
        const session = await setupRandomSession();

        // TODO Add assertions on the response (once defined in the API)
      });
    });

    describe("with an invalid session key", () => {
      it("should reply with status code 403", async () => {
        const session = await setupRandomSession();

        await request(app)
          .get(`/api${session.uri}/status?sessionKey=${faker.random.uuid()}`)
          .expect(403);
      });
    });
  });
});

describe("MemberController", () => {
  describe("createMember()", () => {
    it("should return a member object", async () => {
      const session = await setupRandomSession();
      const member = await MemberController.createMember(session);
      expect(member).toBeInstanceOf(Member);
      expect(member.session).toBe(session);

      expect(Member.findOne({ id: member.id, sessionId: session.id })).resolves.toMatchObject(
        pick(member, ["secret", "sessionId"])
      );
    });
  });

  describe("mCreateMember (via POST /sessions/:sessionId/members)", () => {
    describe("when joining the session requires a captcha", () => {
      describe("and a captcha is provided", () => {
        it("should reply with a new member", async () => {
          const session = await setupRandomSession(true);
          const captcha = await CaptchaController.createCaptcha();

          const response = await request(app)
            .post(`/api${session.uri}/members`)
            .send({
              captcha: {
                token: captcha.id,
                solution: captcha.solution,
              },
            })
            .expect(201);

          expect(response.body.data).toEqual({
            member: {
              uri: expect.any(String),
              id: expect.any(String),
              secret: expect.any(String),
            },
          });
        });
      });

      describe("and no captcha is provided", () => {
        it("should reply with status 403", async () => {
          const session = await setupRandomSession(true);

          await request(app)
            .post(`/api${session.uri}/members`)
            .expect(403);
        });
      });
    });

    describe("when joining the session requires no captcha", () => {
      it("should reply with a new member", async () => {
        const session = await setupRandomSession(false);

        const response = await request(app)
          .post(`/api${session.uri}/members`)
          .expect(201);

        expect(response.body.data).toEqual({
          member: {
            uri: expect.any(String),
            id: expect.any(String),
            secret: expect.any(String),
          },
        });
      });
    });
  });

  describe("mDeleteMember (via DELETE /sessions/:sessionId/members/:memberId)", () => {
    describe("with an invalid member id", () => {
      it("should reply with status 404", async () => {
        const session = await setupRandomSession();

        await request(app)
          .delete(`/api${session.uri}/members/${faker.random.uuid()}`)
          .expect(404);
      });
    });

    describe("with a valid member id", () => {
      let session: Session, member: Member;
      beforeEach(async () => {
        session = await setupRandomSession();
        member = await MemberController.createMember(session);
      });

      describe("with no or an invalid member secret", () => {
        it("should reply with status 403", async () => {
          await request(app)
            .delete(`/api${member.uri}`)
            .expect(403);
          await request(app)
            .delete(`/api${member.uri}?memberSecret=${faker.random.uuid()}`)
            .expect(403);
        });
      });

      describe("with a valid member secret", () => {
        it("should reply with status 200", async () => {
          await request(app)
            .delete(`/api${member.uri}?memberSecret=${member.secret}`)
            .expect(200);

          await expect(member.reload()).rejects.toBeInstanceOf(EntityNotFoundError);
        });
      });
    });
  });

  describe("mSetUnderstanding (via PUT /sessions/:sessionId/members/:memberId/status)", () => {
    it("should modify a member's understanding property in the database", async () => {
      const session = await setupRandomSession();
      const member = await MemberController.createMember(session);

      let setAndAssertStatus = async (status: boolean) => {
        await request(app)
          .put(`/api${member.uri}/status?memberSecret=${member.secret}`)
          .send({ understanding: status })
          .expect(200);
        await member.reload();
        expect(member.understanding).toBe(status);
      };

      for (const status of [false, false, true, true, false]) {
        await setAndAssertStatus(status);
      }
    });
  });
});
