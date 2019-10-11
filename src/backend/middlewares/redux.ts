import rootReducer from "../../frontend/lib/store/reducers";
import Cookies from "cookies";
import { NextFunction, Request, Response } from "express";
import { createStore } from "redux";
import { getStoredState, persistReducer, persistStore } from "redux-persist";
import { CookieStorage, NodeCookiesWrapper } from "redux-persist-cookie-storage";

/**
 * Express middleware to create a server-side redux store (`req.reduxStore`) with the client's redux
 * state (parsed from cookies).
 */
export async function cookieReduxStoreCreator(req: Request, res: Response, next: NextFunction) {
  const cookieJar = new NodeCookiesWrapper(new Cookies(req, res));

  const persistConfig = {
    key: "evalumate",
    storage: new CookieStorage(cookieJar),
  };

  let state;
  try {
    state = await getStoredState(persistConfig);
  } catch (e) {
    // getStoredState implementation fails when index storage item is not set.
    state = {};
  }

  // Removing the state's _persist key for the server-side (non-persisted) redux store
  //@ts-ignore: Typescript does not know about the _persist key
  const { _persist, ...cleanedState } = state;

  // Not persisting the store here since state changes will not be sent via cookies directly. Instead,
  // the serialized state will be attached to the browser's window object.
  req.reduxStore = createStore(rootReducer, cleanedState);

  next();
}
