import { AppThunkAction } from "StoreTypes";

import { Record } from "../../models/Record";
import { Session } from "../../models/Session";
import { getApiUrl } from "../../util/api";
import { showSnackbar } from "../actions/dialogs";
import { resetSession } from "../actions/session";
import { ApiThunkOptions, callApi } from "./base";

/**
 * Returns a thunk action that retrieves a session's records.
 *
 * @param session The `Session` object specifying the session for which the records shall be
 *                retrieved. Note that the session's `key` property has to be set.
 */
export function fetchRecords(
  session: Session,
  apiThunkOptions?: ApiThunkOptions
): AppThunkAction<Promise<Record[] | undefined>> {
  return async (dispatch) => {
    const response = await dispatch(
      callApi<Record[]>(
        {
          method: "GET",
          url: getApiUrl(`${session.uri}/records?sessionKey=${session.key}`),
        },
        apiThunkOptions,
        [404]
      )
    );

    if (response?.error && response.error.code === 404) {
      // The session was terminated, let's reset it and show a snackbar
      dispatch(resetSession());
      dispatch(showSnackbar("Session was terminated"));
    }

    return response?.data;
  };
}
