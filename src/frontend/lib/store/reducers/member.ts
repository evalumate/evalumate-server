import { setUserRole, setSession } from "../actions/global";
import { combineReducers } from "redux";
import { createReducer, action } from "typesafe-actions";
import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import { Member } from "../../models/Member";
import { setMember, setUnderstanding } from "../actions/member";

export type MemberState = Readonly<{
  /**
   * The `Member` object identifying the user in the current session
   */
  member: Member;
  /**
   * The user's understanding state
   */
  understanding: boolean;
}>;

const initialState: MemberState = {
  member: null,
  understanding: true,
};

const memberReducer = createReducer(initialState)
  .handleAction(setMember, (state, action) => Object.assign({}, state, { member: action.payload }))
  .handleAction(setUnderstanding, (state, action) =>
    Object.assign({}, state, { understanding: action.payload })
  );

export default memberReducer;
