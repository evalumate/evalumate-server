import { getApiUrl } from ".";
import axios from "axios";
import { Member } from "../models/Member";

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
