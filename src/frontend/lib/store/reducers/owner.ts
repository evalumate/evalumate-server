import { setSession } from "../actions/owner";
import { createReducer } from "typesafe-actions";
import { combineReducers } from "redux";
import { RootAction, RootState } from "StoreTypes";
import { Session } from "../../models/Session";

export type OwnerState = Readonly<{
  /**
   * The session that the app is attached to as a master
   */
  session?: Readonly<Session>;
}>;

const initialState: OwnerState = {
  session: null,
};

const sessionReducer = createReducer<Session, RootAction>(initialState.session).handleAction(
  setSession,
  (state, action) => Object.assign({}, action.payload)
);

export default combineReducers({ session: sessionReducer });
