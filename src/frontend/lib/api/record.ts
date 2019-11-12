import { Record } from "../models/Record";
import { Session } from "../models/Session";
import { getApiUrl } from ".";
import axios, { AxiosResponse } from "axios";

/**
 * Retrieves a session's records.
 *
 * @param session The `Session` object specifying the session for which the records shall be
 *                retrieved. Note: The `key` attribute has to be provided.
 * @param afterId (optional) If provided, only records with an id larger than the given integer are
 *                retrieved.
 *
 * @returns The records returned from the API, or null if the session or its key is invalid.
 */
export async function getRecords(session: Session, afterId?: number): Promise<Record[] | null> {
  let reply: AxiosResponse;

  if (typeof afterId === "undefined") {
    reply = await axios.get(getApiUrl(`${session.uri}/records?sessionKey=${session.key}`));
  } else {
    reply = await axios.get(
      getApiUrl(`${session.uri}/records/after/${afterId}?sessionKey=${session.key}`)
    );
  }

  return reply.data.error ? null : reply.data.data;
}
