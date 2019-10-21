import { UserRole } from "../models/UserRole";
import { selectSession, selectUserRole } from "../store/selectors/global";
import { ServerResponse } from "http";
import { Store } from "StoreTypes";

/**
 * Redirects the client to the given domain-relative location.
 *
 * @param location The location to redirect to
 * @param res If provided, the response object will be used to reply with a redirect. Otherwise,
 * client-side execution is assumed and the `push` method of the next.js router is used.
 */
export function redirectTo(location: string, res?: ServerResponse) {
  console.log({ location, res });
  if (res) {
    res.writeHead(302, {
      Location: location,
    });
    res.end();
  } else {
    require("next/router").default.push(location);
  }
}

/**
 * A function to be used in `getInitialProps` that redirects the client or not, depending on the
 * given redux store's state and the current page's `pathname`.
 *
 * @param store A redux store holding the app's current state
 * @param pathname The current page's path name, as passed to `getInitialProps`.
 * @param res The response object for the current request or null, as passed to `getInitialProps`
 */
export function redirectIfApplicable(store: Store, pathname: string, res?: ServerResponse) {
  const state = store.getState();
  const userRole = selectUserRole(state);
  const session = selectSession(state);

  if (pathname === "/") {
    switch (userRole) {
      case UserRole.Owner:
        if (session) {
          redirectTo(`/master/${session.id}`, res);
        }
        break;
    }
  }
}
