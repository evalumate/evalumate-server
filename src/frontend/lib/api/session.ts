import { CaptchaSolution } from "../models/CaptchaSolution";
import { Member } from "../models/Member";
import { Session } from "../models/Session";
import { getApiUrl } from ".";
import axios from "axios";

/**
 * Given an object with session options, tries to create a new session.
 * @param sessionOptions The options passed to the API
 *
 * @returns The Session object with the information returned by the server or null if the server
 * replied with an error (most likely 403)
 */
export async function createSession(sessionOptions: {
  sessionName: string;
  captchaRequired: boolean;
  captcha: CaptchaSolution;
}): Promise<Session> {
  const reply = await axios.post(getApiUrl("/sessions"), sessionOptions);
  return reply.data.error ? null : reply.data.data.session;
}

/**
 * Fetches session information based on a session id.
 *
 * @param sessionId The id of the session to retrieve information for.
 *
 * @returns A `Session` object or `null` if the session id does not exist. Note: The `Session`
 * object does not contain a sessionKey.
 *
 */
export async function getSession(sessionId: string): Promise<Session> {
  const reply = await axios.get(getApiUrl(`/sessions/${sessionId}`));
  return reply.data.error ? null : reply.data.data.session;
}

/**
 * Tries to join a session and returns a `Member` object on success.
 *
 * @param sessionId The id of the session to be joined
 * @param captcha A `CaptchaSolution` object if joining the session requires a captcha
 *
 * @returns A `Member` object on success, or `null` if the session does not exist (error 404) or the
 * captcha solution is invalid (error 403).
 */
export async function joinSession(sessionId: string, captcha?: CaptchaSolution): Promise<Member> {
  const reply = await axios.post(
    getApiUrl(`/sessions/${sessionId}/members`),
    captcha ? { captcha } : {}
  );
  return reply.data.error ? null : reply.data.data.member;
}

/**
 * Deletes a session.
 *
 * @param session The `Session` object specifying the session to be deleted. Note: The `key`
 *                attribute has to be set.
 *
 * @returns `True` on success, or `False` if the session does not exist (error 404) or the session
 * key is invalid (error 403).
 */
export async function deleteSession(session: Session): Promise<boolean> {
  const reply = await axios.delete(getApiUrl(`${session.uri}?sessionKey=${session.key}`));
  return !reply.data.error;
}
