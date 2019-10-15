import { setUserRole } from "../actions/global";
import { combineReducers } from "redux";
import { createReducer } from "typesafe-actions";

/**
 * The role of the app user
 */
export enum UserRole {
  /**
   * The app user is just a visitor and has not yet created or joined a session
   */
  Visitor,
  /**
   * The app user is a member of a session
   */
  Member,
  /**
   * The app user is the owner of a session
   */
  Owner,
}

export type GlobalState = Readonly<{
  userRole: UserRole;
}>;

const initialState: GlobalState = {
  userRole: UserRole.Visitor,
};

const globalReducer = createReducer(initialState).handleAction(setUserRole, (state, action) =>
  Object.assign({}, state, { userRole: action.payload })
);

export default globalReducer;
