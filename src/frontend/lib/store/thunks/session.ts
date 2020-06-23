import { AppThunkAction } from "StoreTypes";

import { getApiUrl } from "../../api";
import { CaptchaSolution } from "../../models/CaptchaSolution";
import { Member } from "../../models/Member";
import { Session } from "../../models/Session";
import { setMemberSession, setOwnerSession } from "../actions/session";
import { ApiThunkOptions, callApi } from "./base";

/**
 * Given an object with session options, returns a thunk action that tries to create a new session.
 * If it succeeds, it returns the retrieved `Session` object, dispatches `setOwnerSession`, and
 * shows a snackbar (if not specified otherwise in apiThunkOptions).
 *
 * @param sessionOptions The options passed to the API
 */
export function createSession(
  sessionOptions: {
    sessionName: string;
    captchaRequired: boolean;
    captcha: CaptchaSolution;
  },
  apiThunkOptions?: ApiThunkOptions
): AppThunkAction<Promise<Session | undefined>> {
  return async (dispatch) => {
    const response = await dispatch(
      callApi<{ session: Session }>(
        {
          method: "POST",
          url: getApiUrl("/sessions"),
          data: sessionOptions,
        },
        {
          successSnackbarMessage: `Session "${sessionOptions.sessionName}" was created`,
          ...apiThunkOptions,
        },
        [403]
      )
    );
    const session = response?.data?.session;
    if (session) {
      dispatch(setOwnerSession(session));
    }
    return session;
  };
}

/**
 * Returns a thunk action that fetches session information based on a session id and returns a
 * `Session` object on success. Note: The `Session` object does not contain a `sessionKey` property.
 *
 * @param sessionId The id of the session to retrieve information for.
 */
export function fetchSession(
  sessionId: string,
  apiThunkOptions?: ApiThunkOptions
): AppThunkAction<Promise<Session | undefined>> {
  return async (dispatch) => {
    const response = await dispatch(
      callApi<{ session: Session }>(
        {
          method: "GET",
          url: getApiUrl(`/sessions/${sessionId}`),
        },
        apiThunkOptions,
        [404]
      )
    );
    return response?.data?.session;
  };
}

/**
 * A thunk action that tries to join a session. On success, it returns a `Member` object and
 * dispatches `setMemberSession`. Otherwise (if the session does not exist (error 404) or the
 * captcha solution is invalid (error 403), or on an any other unexpected error), the thunk action
 * returns `undefined`.
 *
 * @param session The `Session` object representing the session to be joined
 * @param captcha A `CaptchaSolution` object if joining the session requires a captcha
 */
export function joinSession(
  session: Session,
  captcha?: CaptchaSolution,
  apiThunkOptions?: ApiThunkOptions
): AppThunkAction<Promise<Member | undefined>> {
  return async (dispatch) => {
    const response = await dispatch(
      callApi<{ member: Member }>(
        {
          method: "POST",
          url: getApiUrl(`${session.uri}/members`),
          data: captcha ? { captcha } : {},
        },
        {
          successSnackbarMessage: `Joined session "${session.name}"`,
          ...apiThunkOptions,
        },
        [403]
      )
    );
    const member = response?.data?.member;
    if (member) {
      dispatch(setMemberSession({ session, member }));
    }
    return member;
  };
}

/**
 * Returns a thunk action that deletes a session and returns `true` on success, or `false` if the
 * session does not exist (error 404) or the session key is invalid (error 403).
 *
 * @param session The `Session` object specifying the session to be deleted. Note: The `key`
 *                attribute has to be set.
 */
export function deleteSession(
  session: Session,
  apiThunkOptions?: ApiThunkOptions
): AppThunkAction<Promise<boolean>> {
  return async (dispatch) => {
    const response = await dispatch(
      callApi(
        {
          method: "DELETE",
          url: getApiUrl(`${session.uri}?sessionKey=${session.key}`),
        },
        apiThunkOptions
      )
    );
    return !(typeof response === "undefined" || response.error);
  };
}
