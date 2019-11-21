import Cookies from "cookies";
import { NextFunction, Request, Response } from "express";
import { getStoredState } from "redux-persist";
import { CookieStorage, NodeCookiesWrapper } from "redux-persist-cookie-storage";
import { sharedPersistConfig } from "../../frontend/lib/store/persist.config";

/**
 * Express middleware to create a server-side redux store (`req.reduxStore`) with the client's redux
 * state (parsed from cookies).
 */
export async function cookieReduxStateExtractor(req: Request, res: Response, next: NextFunction) {
  const cookieJar = new NodeCookiesWrapper(new Cookies(req, res));

  const persistConfig = {
    ...sharedPersistConfig,
    storage: new CookieStorage(cookieJar),
  };

  let state: any | undefined;
  try {
    state = await getStoredState(persistConfig);
  } catch (e) {
    // getStoredState implementation fails when index storage item is not set.
    state = {};
  }

  // Removing the state's _persist key for the server-side (non-persisted) redux store
  if (state && typeof state._persist !== undefined) {
    const { _persist, ...cleanedState } = state;
    state = cleanedState;
  }

  req.reduxState = state;
  next();
}
