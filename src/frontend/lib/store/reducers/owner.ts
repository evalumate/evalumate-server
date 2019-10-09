import { setSession } from "../actions/owner";
import { getType } from "typesafe-actions";
import { combineReducers } from "redux";
import { RootAction } from "StoreTypes";
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

export const sessionReducer = (state: Session = initialState.session, action: RootAction) => {
  switch (action.type) {
    case getType(setSession):
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};

export default combineReducers({ session: sessionReducer });
