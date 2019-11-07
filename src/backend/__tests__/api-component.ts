import { setupRandomSession } from "../__setup__/entities";
import App from "../App";
import CaptchaController, { captchaTtl } from "../controllers/CaptchaController";
import MemberController from "../controllers/MemberController";
import RecordController, { recordInterval } from "../controllers/RecordController";
import SessionController from "../controllers/SessionController";
import Captcha from "../entities/Captcha";
import Member from "../entities/Member";
import Record from "../entities/Record";
import Session from "../entities/Session";
import InvalidCaptchaSolutionException from "../exceptions/InvalidCaptchaSolutionException";
import InvalidCaptchaTokenException from "../exceptions/InvalidCaptchaTokenException";
import { getUnixTimestamp } from "../utils/time";
import faker from "faker";
import pick from "lodash/pick";
import request from "supertest";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { number } from "yup";
import HttpStatus from "http-status-codes";

jest.useFakeTimers();
const advanceTimersBySeconds = (seconds: number) => jest.advanceTimersByTime(seconds * 1000);

/**
 * Cheaty workaround to wait for async functions called as a consequence to
 * `jest.advanceTimersByTime()` to complete. Returns a promise that is resolved once the JavaScript
 * PromiseJobs queue has been processed `n` times (implemented by awaiting `n` dummy promises).
 *
 * Note: After awaiting the promise returned by this function, only functions that have awaited <=
 * `n` + 1 promises in total (including promises used internally by other async function calls) will
 * have finished after the promise has been resolved.
 *
 * @param n (optional) The number of promises that will be awaited subsequently by this function.
 *          Defaults to 20.
 */
async function driveAsyncFunctions(n?: number) {
  if (typeof n === "undefined") {
    n = 20;
  }
  for (let i = 0; i < n; i++) {
    await Promise.resolve(); // Wait for promises in the PromiseJobs queue to be resolved
  }
}

jest.mock("../utils/time");
const increaseUnixTimestamp: (seconds: number) => void = require("../utils/time")
  .__increaseUnixTimestamp;

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
    let captcha: Captcha;

    beforeEach(async () => {
      captcha = new Captcha();
      captcha.solution = faker.random.alphaNumeric(faker.random.number({ min: 4, max: 10 }));
      await captcha.save();
    });

    describe("with a valid captcha token", () => {
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
      describe("(non-existent)", () => {
        it("should throw InvalidCaptchaTokenException", async () => {
          await expect(
            CaptchaController.validateCaptchaSolution(
              faker.random.uuid(),
              faker.random.alphaNumeric(4)
            )
          ).rejects.toThrow(InvalidCaptchaTokenException);
        });
      });

      describe("(expired)", () => {
        it("should throw InvalidCaptchaTokenException", async () => {
          jest.useFakeTimers();

          increaseUnixTimestamp(captchaTtl + 1);
          advanceTimersBySeconds(captchaTtl + 1);
          await driveAsyncFunctions();

          await expect(
            CaptchaController.validateCaptchaSolution(captcha.id, captcha.solution)
          ).rejects.toThrow(InvalidCaptchaTokenException);
        });
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

      await expect(Session.findOne(response.body.data.session.id)).resolves.toBeInstanceOf(Session);
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

      await expect(Member.findOne({ id: member.id, sessionId: session.id })).resolves.toMatchObject(
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

describe("RecordController", () => {
  const advanceTime = async (seconds: number) => {
    increaseUnixTimestamp(seconds);
    advanceTimersBySeconds(seconds);
    await driveAsyncFunctions(300);
  };

  let session: Session;
  let members: Member[];

  beforeEach(async () => {
    session = await setupRandomSession();

    members = [];
    for (let i = 0; i < 10; i++) {
      members.push(await MemberController.createMember(session));
    }
  });

  it("should generate correct records", async () => {
    // Define helper functions
    let recordExpectations: jest.CustomMatcher[] = [];
    const addRecordExpectationAndExpect = async (
      registeredMembersCount: number,
      activeMembersCount: number,
      understandingMembersCount: number
    ) => {
      recordExpectations.push(
        expect.objectContaining({
          id: recordExpectations.length,
          registeredMembersCount,
          activeMembersCount,
          understandingMembersCount,
        })
      );

      let records = await RecordController.getRecordsBySessionId(session.id);
      expect(records).toEqual(recordExpectations);
    };

    // Simulate a session
    // Note: member.activeTimeout is set to 60 in config/test.json, while record.interval is 15

    // Ten little members...
    await advanceTime(recordInterval); // Simulate waiting for a record to be generated
    await addRecordExpectationAndExpect(10, 10, 10); // Test whether the record matches our expectations

    // Remove the last member
    await members.pop()!.remove();
    await advanceTime(recordInterval);
    await addRecordExpectationAndExpect(9, 9, 9);

    // Let the first member back out
    members[0].understanding = false;
    members[0].lastPingTime = getUnixTimestamp();
    await members[0].save();
    await advanceTime(recordInterval);
    await addRecordExpectationAndExpect(9, 9, 8);

    // Simulate a ping of the second member
    members[1].lastPingTime = getUnixTimestamp();
    await members[1].save();
    await advanceTime(recordInterval);
    await addRecordExpectationAndExpect(9, 9, 8);

    // Wait for a record interval – all members except 1 and 2 should be considered inactive now.
    // Hence, only one (the first) member should be considered understanding.
    await advanceTime(recordInterval);
    await addRecordExpectationAndExpect(9, 2, 1);

    // Drop another member, just for fun
    await members.pop()!.remove();
    await advanceTime(recordInterval);
    await addRecordExpectationAndExpect(8, 2, 1);

    // Member 1 should become inactive now.
    await advanceTime(recordInterval);
    await addRecordExpectationAndExpect(8, 1, 1);

    // Member 2 should become inactive now. He was the only one understanding. Too bad.
    await advanceTime(recordInterval);
    await addRecordExpectationAndExpect(8, 0, 0);

    // Remove all the remaining members
    await Promise.all(members.map(member => member.remove()));
    await advanceTime(recordInterval);
    await addRecordExpectationAndExpect(0, 0, 0); // ... and then there were none.
  });

  describe("getRecordsBySessionId()", () => {
    it("should return a session's records", async () => {
      const getRecords = () => RecordController.getRecordsBySessionId(session.id);

      await expect(getRecords()).resolves.toBeArrayOfSize(0);

      await advanceTime(recordInterval); // Create a single record
      await expect(getRecords()).resolves.toEqual([expect.any(Record)]);

      // Create two records (separate calls needed because of driveAsyncFunctions())
      for (let i = 0; i < 2; i++) {
        await advanceTime(recordInterval);
      }
      await expect(getRecords()).resolves.toBeArrayOfSize(3);
    });
  });

  describe("mGetRecords (via GET /sessions/:sessionId/records)", () => {
    it("should return a session's records in the specified format", async () => {
      const retrieveRecords = async () => {
        const response = await request(app)
          .get(`/api${session.uri}/records?sessionKey=${session.key}`)
          .expect(200);
        return response.body.data;
      };

      await expect(retrieveRecords()).resolves.toBeArrayOfSize(0);

      // Create two records
      for (let i = 0; i < 2; i++) {
        await advanceTime(recordInterval);
      }
      const records = await retrieveRecords();

      expect(records).toBeArrayOfSize(2);
      for (let i = 0; i < records.length; i++) {
        expect(records[i]).toEqual({
          id: i,
          time: expect.any(Number),
          registeredMembersCount: expect.any(Number),
          activeMembersCount: expect.any(Number),
          understandingMembersCount: expect.any(Number),
        });
      }
    });
  });

  describe("getRecordsBySessionIdAfter()", () => {
    it("should return a session's records starting after a given record id", async () => {
      const getRecordsAfter = (recordId: number) =>
        RecordController.getRecordsBySessionIdAfter(session.id, recordId);

      await expect(getRecordsAfter(0)).resolves.toBeArrayOfSize(0);
      await expect(
        getRecordsAfter(faker.random.number({ min: -10000, max: 10000 }))
      ).resolves.toBeArrayOfSize(0);

      // Create two records
      for (let i = 0; i < 2; i++) {
        await advanceTime(recordInterval);
      }

      await expect(getRecordsAfter(1)).resolves.toBeArrayOfSize(0);
      await expect(getRecordsAfter(0)).resolves.toEqual([expect.any(Record)]);
      await expect(getRecordsAfter(-1)).resolves.toBeArrayOfSize(2);
    });
  });

  describe("mGetRecordsAfter (via GET /sessions/:sessionId/records/after/:recordId)", () => {
    it("should fail with an invalid recordId", async () => {
      const testResponse = async (recordId: string, expectedStatus: number) =>
        await request(app)
          .get(`/api${session.uri}/records/after/${recordId}?sessionKey=${session.key}`)
          .expect(expectedStatus);

      await Promise.all([
        testResponse("", HttpStatus.NOT_FOUND),
        testResponse(faker.random.alphaNumeric(10), HttpStatus.BAD_REQUEST),
        testResponse("-42", HttpStatus.BAD_REQUEST),
        testResponse("4.2", HttpStatus.BAD_REQUEST),
        testResponse("-4.2", HttpStatus.BAD_REQUEST),
        testResponse("0xFF", HttpStatus.BAD_REQUEST),
      ]);
    });

    it("should return a session's records in the specified format", async () => {
      const retrieveRecordsAfter = async (recordId: number) => {
        const response = await request(app)
          .get(`/api${session.uri}/records/after/${recordId}?sessionKey=${session.key}`)
          .expect(200);
        return response.body.data;
      };

      await expect(retrieveRecordsAfter(0)).resolves.toBeArrayOfSize(0);

      // Create two records
      for (let i = 0; i < 2; i++) {
        await advanceTime(recordInterval);
      }

      await expect(retrieveRecordsAfter(0)).resolves.toEqual([
        {
          id: 1,
          time: expect.any(Number),
          registeredMembersCount: expect.any(Number),
          activeMembersCount: expect.any(Number),
          understandingMembersCount: expect.any(Number),
        },
      ]);
    });
  });
});
