import { AppThunkAction } from "StoreTypes";

import { getApiUrl } from "../../api";
import { CaptchaSolution } from "../../models/CaptchaSolution";
import { Member } from "../../models/Member";
import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import { setSession, setUserRole } from "../actions/global";
import { setMember, setUnderstanding } from "../actions/member";
import { ApiThunkOptions, callApi } from "./base";

/**
 * Given an object with session options, returns a thunk action that tries to create a new session.
 * If it succeeds, it returns the retrieved `Session` object and dispatches `setSession`,
 * `setUserRole(UserRole.Owner)`, and shows a snackbar (if not specified otherwise in
 * apiThunkOptions).
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
      dispatch(setSession(session));
      dispatch(setUserRole(UserRole.Owner));
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
 * dispatches `setSession`, `setMember` and `setUserRole(UserRole.Member)`.
 *
 * @param session The `Session` object representing the session to be joined
 * @param captcha A `CaptchaSolution` object if joining the session requires a captcha
 *
 * @returns A thunk action that returns a `Member` object on success, or `undefined` if the session
 * does not exist (error 404) or the captcha solution is invalid (error 403), or on an any other
 * unexpected error.
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
      dispatch(setSession(session));
      dispatch(setMember(member));
      dispatch(setUnderstanding(true));
      dispatch(setUserRole(UserRole.Member));
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
