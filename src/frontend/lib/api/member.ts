import axios from "axios";

import { Member } from "../models/Member";
import { getApiUrl } from ".";

/**
 * Sets the understanding flag of a member.
 *
 * @param member The `Member` object specifying the member to set the flag for
 * @param understanding The value to set the `understanding` flag to
 *
 * @returns `true` if the understanding flag was successfully set or `false` if the server
 * replied with error 403 or 404.
 */
export async function setUnderstanding(member: Member, understanding: boolean): Promise<boolean> {
  const reply = await axios.put(getApiUrl(`${member.uri}/status?memberSecret=${member.secret}`), {
    understanding,
  });
  return !reply.data.error;
}

/**
 * Deletes a member.
 *
 * @param member The `Member` object specifying the member to be deleted.
 *
 * @returns `True` on success, or `False` if the member or its session does not exist (error 404) or
 * the member secret is invalid (error 403).
 */
export async function deleteMember(member: Member): Promise<boolean> {
  const reply = await axios.delete(getApiUrl(`${member.uri}?memberSecret=${member.secret}`));
  return !reply.data.error;
}
