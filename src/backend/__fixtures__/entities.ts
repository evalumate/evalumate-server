import SessionController from "../controllers/SessionController";

import faker from "faker";

/**
 * Creates a session with randomized parameters in the database using `SessionController.createSession()`.
 *
 * @param captchaRequired The session's `captchaRequired` flag. Defaults to a random boolean.
 *
 * @returns A session database entity object.
 */
export async function setupRandomSession(captchaRequired?: boolean) {
  if (typeof captchaRequired === "undefined") {
    captchaRequired = faker.random.boolean();
  }
  return await SessionController.createSession(
    faker.lorem.words(faker.random.number({ min: 1, max: 5 })),
    captchaRequired
  );
}
