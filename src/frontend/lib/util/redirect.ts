import { getSession } from "../api/session";
import { UserRole } from "../models/UserRole";
import { setSession, setUserRole, showSnackbar } from "../store/actions/global";
import { selectSession, selectUserRole } from "../store/selectors/global";
import { ServerResponse } from "http";
import minimatch from "minimatch";
import nextRouter from "next/router";
import { Store } from "StoreTypes";
import { ParsedUrlQuery } from "querystring";

/**
 * Redirects the client to the given domain-relative location.
 *
 * @param location The location to redirect to
 * @param res If provided, the response object will be used to reply with a redirect. Otherwise,
 * client-side execution is assumed and the `push` method of the next.js router is used.
 */
export function redirectTo(location: string, res?: ServerResponse) {
  if (res) {
    res.writeHead(302, {
      Location: location,
    });
    res.end();
  } else {
    nextRouter.push(location);
  }
}

/**
 * A function to be used in `getInitialProps` that, depending on the given redux store's state and
 * the current page's `pathname`, either returns a redirect destination as a string or null.
 *
 * Note: This function also conditionally dispatches actions to the store.
 *
 * @param store A redux store holding the app's current state
 * @param pathname The current page's path name, as passed to `getInitialProps`.
 * @param query The current requests query parameters, as passed to `getInitialProps`.
 *
 * @returns The redirect destination URL or `null`
 */
export async function getRedirectUrlIfApplicable(
  store: Store,
  pathname: string,
  query: ParsedUrlQuery
) {
  const state = store.getState();
  const role = selectUserRole(state);
  const session = selectSession(state);

  if (role != UserRole.Visitor) {
    if (!(session && (await getSession(session.id)))) {
      // Session is invalid
      store.dispatch(setUserRole(UserRole.Visitor));
      store.dispatch(setSession(null));

      if (session) {
        // Session was not `null` before we reset it
        if (query.sessionId && query.sessionId == session.id) {
          if (
            (pathname == "/client/[sessionId]" && role == UserRole.Member) ||
            (pathname == "/master/[sessionId]" && role == UserRole.Owner)
          ) {
            store.dispatch(showSnackbar("The session has expired."));
            return "/";
          }
        }
      }
    } else {
      // Session is valid
      switch (role) {
        case UserRole.Member:
          if (pathname === "/client/[sessionId]" && query.sessionId == session.id) {
            return null;
          }
          if (["/", "/client", "/client/[sessionId]"].includes(pathname)) {
            if (pathname == "/client/[sessionId]") {
              store.dispatch(showSnackbar("You cannot join multiple sessions at the same time."));
            }
            return `/client/${session.id}`;
          }
          break;
        case UserRole.Owner:
          if (pathname === "/master/[sessionId]" && query.sessionId == session.id) {
            return null;
          }
          if (["/", "/master", "/master/[sessionId]"].includes(pathname)) {
            if (pathname == "/master/[sessionId]") {
              store.dispatch(showSnackbar("You cannot join multiple sessions at the same time."));
            }
            return `/master/${session.id}`;
          }
          break;
      }
    }
  }

  return null;
}
