import faker from "faker";
import { QueryFailedError, getConnection } from "typeorm";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

import { connectToInMemoryDatabase } from "../__setup__/database";
import Captcha from "../entities/Captcha";

jest.mock("../utils/time");
const increaseUnixTimestamp: (seconds: number) => void = require("../utils/time")
  .__increaseUnixTimestamp;

beforeAll(async () => {
  await connectToInMemoryDatabase();
});

afterAll(() => getConnection().close());

describe("RandomIdEntity", () => {
  describe("save() on a subclass", () => {
    it("should fail at the latest when all ids are taken", async () => {
      // Temporarily modifying the Captcha class to use a tiny id range
      const initialRandomIdLength = Captcha["randomIdLength"];
      const initialRandomIdAlphabet = Captcha["randomIdAlphabet"];
      Captcha["randomIdLength"] = 1;
      Captcha["randomIdAlphabet"] = "ab";

      async function createCaptcha() {
        const captcha = new Captcha();
        captcha.solution = faker.random.alphaNumeric(6);
        await captcha.save();
        return captcha;
      }

      const captcha1 = await createCaptcha();
      expect(["a", "b"]).toContain(captcha1.id);

      let captcha2: Captcha | null = null;
      while (!captcha2) {
        try {
          captcha2 = await createCaptcha();
        } catch (error) {
          expect(error).toBeInstanceOf(QueryFailedError);
        }
      }

      expect(["a", "b"]).toContain(captcha2.id);
      expect(captcha2.id).not.toBe(captcha1.id);

      await expect(createCaptcha()).rejects.toBeInstanceOf(QueryFailedError);

      await Promise.all([captcha1.remove(), captcha2.remove()]);

      // Restore Captcha id range
      Captcha["randomIdLength"] = initialRandomIdLength;
      Captcha["randomIdAlphabet"] = initialRandomIdAlphabet;
    });
  });
});

describe("Captcha", () => {
  let captcha: Captcha;

  beforeEach(async () => {
    captcha = new Captcha();
    captcha.solution = faker.random.alphaNumeric(6);
    await captcha.save();
  });

  afterEach(async () => {
    try {
      await captcha.remove();
    } catch (error) {}
  });

  describe("findAliveByToken()", () => {
    it("should return a captcha by its token", async () => {
      const captchaFromDb = await Captcha.findAliveById(captcha.id, 120);
      expect(captchaFromDb).toBeDefined();
    });

    it("should respect the time to live parameter", async () => {
      const ttl = faker.random.number({ min: 1, max: 360 });
      increaseUnixTimestamp(ttl + 1);
      const captchaFromDb = await Captcha.findAliveById(captcha.id, ttl);
      expect(captchaFromDb).toBeUndefined();
    });
  });

  describe("deleteExpired()", () => {
    it("should delete an expired captcha", async () => {
      const ttl = faker.random.number({ min: 1, max: 360 });
      increaseUnixTimestamp(ttl + 1);
      await Captcha.deleteExpired(ttl);
      await expect(captcha.reload()).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it("should not delete a living captcha", async () => {
      await Captcha.deleteExpired(1);
      await captcha.reload();
      expect(captcha).toBeDefined();
    });
  });
});
