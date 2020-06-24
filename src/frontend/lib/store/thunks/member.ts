import { AppThunkAction } from "StoreTypes";

import { Member } from "../../models/Member";
import { getApiUrl } from "../../util/api";
import { ApiThunkOptions, callApi } from "./base";

/**
 * Returns a thunk action that sets the understanding flag of a member and returns `true` on success
 * and `false` otherwise.
 *
 * @param member The `Member` object specifying the member to set the flag for
 * @param understanding The value to set the `understanding` flag to
 */
export function setIsUnderstanding(
  member: Member,
  understanding: boolean,
  apiThunkOptions?: ApiThunkOptions
): AppThunkAction<Promise<boolean>> {
  return async (dispatch) => {
    const response = await dispatch(
      callApi(
        {
          method: "PUT",
          url: getApiUrl(`${member.uri}/status?memberSecret=${member.secret}`),
          data: { understanding },
        },
        apiThunkOptions
      )
    );
    return !(typeof response === "undefined" || response.error);
  };
}

/**
 * Returns a thunk action that deletes a member and returns `true` on success, or `false` on any
 * error (for instance, error 404 if the member or its session does not exist or error 403 if the
 * member secret is invalid).
 *
 * @param member The `Member` object specifying the member to be deleted.
 */
export function deleteMember(
  member: Member,
  apiThunkOptions?: ApiThunkOptions
): AppThunkAction<Promise<boolean>> {
  return async (dispatch) => {
    const response = await dispatch(
      callApi(
        {
          method: "DELETE",
          url: getApiUrl(`${member.uri}?memberSecret=${member.secret}`),
        },
        apiThunkOptions
      )
    );
    return !(typeof response === "undefined" || response.error);
  };
}
