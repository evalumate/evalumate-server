import { getApiUrl } from ".";
import axios from "axios";

export type Session = { uri: string; id: string; key: string };

/**
 * Given an object with session options, tries to create a new session.
 * @param sessionOptions The options passed to the API
 *
 * @returns The session object returned by the server or null if the server replied with 403
 */
export async function createSession(sessionOptions: {
  sessionName: string;
  captchaRequired: boolean;
  captcha: { solution: string; token: string };
}): Promise<Session | null> {
  const reply = await axios.post(getApiUrl("sessions"), sessionOptions);
  return reply.data.error ? null : reply.data.data.session;
}
