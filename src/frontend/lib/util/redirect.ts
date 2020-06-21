import { ServerResponse } from "http";

import nextRouter from "next/router";

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
