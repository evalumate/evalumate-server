import { createAction } from "typesafe-actions";

import { Member } from "../../models/Member";
import { Session } from "../../models/Session";

export const setMemberSession = createAction("Session:Member:set")<{
  session: Session;
  member: Member;
}>();
export const setOwnerSession = createAction("Session:Owner:set")<Session>();
export const resetSession = createAction("Session:reset")();

export const setIsUnderstanding = createAction("Session:Member:setIsUnderstanding")<boolean>();
