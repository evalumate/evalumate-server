import { AppThunkAction } from "StoreTypes";

import { getApiUrl } from "../../api";
import { Record } from "../../models/Record";
import { Session } from "../../models/Session";
import { ApiThunkOptions, callApi } from "./base";

/**
 * Returns a thunk action that retrieves a session's records.
 *
 * @param session The `Session` object specifying the session for which the records shall be
 *                retrieved. Note that the session's `key` property has to be set.
 * @param afterId (optional) If provided, only records with an id larger than the given integer are
 *                retrieved.
 */
export function getRecords(
  session: Session,
  afterId?: number,
  apiThunkOptions?: ApiThunkOptions
): AppThunkAction<Promise<Record[] | undefined>> {
  return async (dispatch) => {
    const response = await dispatch(
      callApi<Record[]>(
        {
          method: "GET",
          url: getApiUrl(
            afterId
              ? `${session.uri}/records/after/${afterId}?sessionKey=${session.key}`
              : `${session.uri}/records?sessionKey=${session.key}`
          ),
        },
        apiThunkOptions
      )
    );
    return response?.data;
  };
}
