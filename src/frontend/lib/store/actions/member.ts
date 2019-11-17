import { Member } from "../../models/Member";
import { createAction } from "typesafe-actions";

export const setMember = createAction("Member:setMember")<Member | null>();
export const setUnderstanding = createAction("Member:setUnderstanding")<boolean>();
