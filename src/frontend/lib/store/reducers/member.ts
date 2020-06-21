import { createReducer } from "typesafe-actions";

import { Member } from "../../models/Member";
import { setMember, setUnderstanding } from "../actions/member";

export type MemberState = Readonly<{
  /**
   * The `Member` object identifying the user in the current session
   */
  member: Readonly<Member> | null;
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
  .handleAction(setMember, (state, action) => ({
    ...state,
    member: action.payload,
  }))
  .handleAction(setUnderstanding, (state, action) => ({
    ...state,
    understanding: action.payload,
  }));

export default memberReducer;
