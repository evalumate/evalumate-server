import delay from "delay";
import Captcha from "../entities/Captcha";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import faker from "faker";
import { QueryFailedError, getConnection } from "typeorm";
import { connectToInMemoryDatabase } from "../../test/setup";

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
      await captcha.remove();
    });

    it("should respect the time to live parameter", async () => {
      await delay(100);
      const captchaFromDb = await Captcha.findAliveById(captcha.id, 0.05);
      expect(captchaFromDb).toBeUndefined();
    });
  });

  describe("deleteExpired()", () => {
    it("should delete an expired captcha", async () => {
      await delay(50);
      await Captcha.deleteExpired(0.05);
      await expect(captcha.reload()).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it("should not delete a living captcha", async () => {
      await Captcha.deleteExpired(1);
      await captcha.reload();
      expect(captcha).toBeDefined();
    });
  });
});
