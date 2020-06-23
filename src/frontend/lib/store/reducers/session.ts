import { createReducer } from "typesafe-actions";

import { Member } from "../../models/Member";
import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import {
  resetSession,
  setIsUnderstanding,
  setMemberSession,
  setOwnerSession,
} from "../actions/session";

export type SessionState = Readonly<{
  /**
   * The role of the app user
   */
  userRole: UserRole;
  /**
   * The session that the app is attached to (in client or master mode)
   */
  session: Readonly<Session> | null;
  /**
   * The `Member` object identifying the user in the current session if the user is a session member
   */
  member: Readonly<Member & { isUnderstanding: boolean }> | null;
}>;

const initialState: SessionState = {
  userRole: UserRole.Visitor,
  session: null,
  member: null,
};

const reducer = createReducer(initialState)
  .handleAction(setOwnerSession, (state, action) => ({
    ...state,
    userRole: UserRole.Owner,
    session: action.payload,
  }))
  .handleAction(setMemberSession, (state, action) => ({
    ...state,
    userRole: UserRole.Member,
    session: action.payload.session,
    member: { ...action.payload.member, isUnderstanding: true },
  }))
  .handleAction(resetSession, (state) => ({
    ...state,
    userRole: UserRole.Visitor,
    session: null,
    member: null,
  }))
  .handleAction(setIsUnderstanding, (state, action) => ({
    ...state,
    member: state.member
      ? {
          ...state.member,
          isUnderstanding: action.payload,
        }
      : null,
  }));

export default reducer;
