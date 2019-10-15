import { Session } from "../../models/Session";
import { setSession } from "../actions/owner";
import { combineReducers } from "redux";
import { createReducer } from "typesafe-actions";

export type OwnerState = Readonly<{
  /**
   * The session that the app is attached to as a master
   */
  session: Readonly<Session> | null;
}>;

const initialState: OwnerState = {
  session: null,
};

const sessionReducer = createReducer(initialState.session).handleAction(
  setSession,
  (state, action) => Object.assign({}, action.payload)
);

export default combineReducers({ session: sessionReducer });
