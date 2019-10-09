import { setUserRole } from "../actions/global";
import { getType } from "typesafe-actions";
import { combineReducers } from "redux";
import { RootAction } from "StoreTypes";

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

export const userRoleReducer = (state: UserRole = initialState.userRole, action: RootAction) => {
  switch (action.type) {
    case getType(setUserRole):
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};

export default combineReducers({ userRole: userRoleReducer });
