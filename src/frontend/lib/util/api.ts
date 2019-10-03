import axios from "axios";
import { response } from "express";
import { stat } from "fs";

const apiRoot = "/api/";

axios.defaults.validateStatus = (status: number) => {
  return (status >= 200 && status < 300) || status == 403 || status == 404; // Do not throw 403 and 404 HTTP errors
};

export class ServerError {
  constructor(public code: number, public name: string, public message: string) {}
}

export async function getConfig(): Promise<{ captchaLength: number }> {
  const config = (await axios.get(apiRoot)).data.data;
  // TODO replace with real configuration once implemented in the backend
  return {
    captchaLength: 4,
  };
}

export type Captcha = { image: string; token: string };

export async function getCaptcha(): Promise<Captcha> {
  return (await axios.get(apiRoot + "captcha")).data.data.captcha;
}

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
  const reply = await axios.post(apiRoot + "sessions", sessionOptions);
  return reply.data.error ? null : reply.data.data.session;
}
